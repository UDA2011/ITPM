require('dotenv').config();
const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");
const axios = require("axios");
const { OpenAI } = require("openai");

// Initialize OpenAI with enhanced configuration
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15000, // 15 seconds timeout
  maxRetries: 2
};

let openai;
try {
  openai = new OpenAI(openaiConfig);
  console.log("OpenAI initialized successfully");
} catch (error) {
  console.error("Failed to initialize OpenAI:", error);
  process.exit(1);
}

// Cache for similar materials to reduce API calls
const materialCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Finds the best supplier based on material requirements
 */
exports.findBestSupplier = async (req, res) => {
  try {
    // Validate request
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid request body" 
      });
    }

    const { material, quantity, priority = 'balanced', additionalRequirements } = req.body;
    
    // Enhanced input validation
    if (!material || typeof material !== 'string' || material.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Valid material name is required" 
      });
    }

    const parsedQuantity = Number(quantity);
if (isNaN(parsedQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number"
      });
    }

    // Normalize material name with caching
    const cacheKey = `material:${material.toLowerCase()}`;
    let normalizedMaterial = materialCache.get(cacheKey);
    
    if (!normalizedMaterial) {
      try {
        normalizedMaterial = await normalizeMaterialName(material.trim());
        materialCache.set(cacheKey, normalizedMaterial);
        setTimeout(() => materialCache.delete(cacheKey), CACHE_TTL);
      } catch (error) {
        console.error("Material normalization failed, using original:", error);
        normalizedMaterial = material.trim();
      }
    }

    // Find suppliers with enhanced query
    const potentialSuppliers = await findSuppliersWithAI(normalizedMaterial, parsedQuantity);
    
    // Prepare response data
    const responseData = {
      success: true,
      searchCriteria: {
        material: normalizedMaterial,
        quantity: parsedQuantity,
        priority,
        additionalRequirements
      },
      timestamp: new Date().toISOString()
    };

    if (!potentialSuppliers || potentialSuppliers.length === 0) {
      // Get AI-curated Alibaba suggestions
      try {
        const alibabaSuggestions = await getAIEnhancedAlibabaSuggestions(
          normalizedMaterial, 
          parsedQuantity,
          priority,
          additionalRequirements
        );
        
        return res.status(200).json({
          ...responseData,
          message: "No matching suppliers found in database",
          suggestions: [],
          alibabaSuggestions: alibabaSuggestions,
          aiExplanation: "Our AI searched our database and couldn't find matching suppliers, so we've curated these options from Alibaba based on your requirements."
        });
      } catch (error) {
        console.error("Alibaba suggestions failed:", error);
        return res.status(200).json({
          ...responseData,
          message: "No matching suppliers found in database or external sources",
          suggestions: [],
          alibabaSuggestions: []
        });
      }
    }

    // Score and rank suppliers
    const scoredSuppliers = await scoreSuppliersWithAI(
      potentialSuppliers,
      normalizedMaterial,
      parsedQuantity,
      priority,
      additionalRequirements
    );

    // Prepare top suggestions
    const topSuggestions = scoredSuppliers.slice(0, 3).map(item => ({
      supplierId: item.supplier._id,
      supplierName: item.supplier.name,
      contact: item.supplier.contact,
      email: item.supplier.email,
      address: item.supplier.address,
      cost: parseFloat(item.materialData.cost.toFixed(2)),
      deliveryTime: item.supplier.deliveryTime,
      rating: parseFloat(item.supplier.supplierRating.toFixed(1)),
      availableQuantity: item.materialData.availableQuantity,
      score: parseFloat(item.score.toFixed(2)),
      aiFeedback: item.aiFeedback,
      lastUpdated: item.supplier.updatedAt || item.supplier.createdAt
    }));

    // Add AI summary if available
    try {
      responseData.aiSummary = await generateAISummary(topSuggestions, normalizedMaterial, parsedQuantity);
    } catch (error) {
      console.error("AI summary generation failed:", error);
    }

    return res.status(200).json({
      ...responseData,
      message: "Found matching suppliers",
      suggestions: topSuggestions,
      alibabaSuggestions: []
    });

  } catch (error) {
    console.error("Supplier search failed:", error);
    return res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred while searching for suppliers" 
    });
  }
};

// AI Utility Functions

/**
 * Normalizes material names using AI
 */
async function normalizeMaterialName(material) {
  if (!openai) throw new Error("OpenAI not initialized");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are a procurement assistant. Standardize this material name for database search. Return only the standardized name, no explanations."
      }, {
        role: "user",
        content: `Standardize: "${material}"`
      }],
      temperature: 0.2,
      max_tokens: 30
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("No content in OpenAI response");
    }

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Material normalization error:", error);
    throw error;
  }
}

/**
 * Finds suppliers with AI-enhanced matching
 */
async function findSuppliersWithAI(material, quantity) {
  try {
    // First try exact match
    let suppliers = await Supplier.find({
      materials: {
        $elemMatch: {
          name: { $regex: new RegExp(`^${material}$`, 'i') },
          availableQuantity: { $gte: quantity }
        }
      }
    }).lean();

    // If no exact matches, find similar materials
    if (!suppliers || suppliers.length === 0) {
      const similarMaterials = await findSimilarMaterials(material);
      
      if (similarMaterials && similarMaterials.length > 0) {
        suppliers = await Supplier.find({
          materials: {
            $elemMatch: {
              name: { $in: similarMaterials },
              availableQuantity: { $gte: quantity }
            }
          }
        }).lean();
      }
    }

    return suppliers || [];
  } catch (error) {
    console.error("Supplier search error:", error);
    return [];
  }
}

/**
 * Finds similar materials using AI
 */
async function findSimilarMaterials(material) {
  if (!openai) {
    console.error("OpenAI not initialized");
    return [];
  }

  const cacheKey = `similar:${material.toLowerCase()}`;
  const cached = materialCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `You are a procurement expert. Return a JSON object with a "similarMaterials" array containing 3-5 materials that could substitute "${material}" in supply chain. Only include technically valid alternatives.`
      }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const result = safeJsonParse(content);
    if (!result || !Array.isArray(result.similarMaterials)) {
      throw new Error("Invalid response format");
    }

    materialCache.set(cacheKey, result.similarMaterials);
    setTimeout(() => materialCache.delete(cacheKey), CACHE_TTL);

    return result.similarMaterials;
  } catch (error) {
    console.error("Similar materials error:", error);
    return [];
  }
}

/**
 * Scores suppliers with AI-enhanced analysis
 */
async function scoreSuppliersWithAI(suppliers, material, quantity, priority, additionalRequirements) {
  if (!suppliers || suppliers.length === 0) return [];

  // Get base scores
  const baseScoredSuppliers = suppliers.map(supplier => {
    const materialData = supplier.materials.find(m => 
      m.name.toLowerCase() === material.toLowerCase()
    );
    
    if (!materialData) return null;

    return {
      supplier,
      materialData,
      score: calculateBaseScore(supplier, materialData, priority)
    };
  }).filter(Boolean);

  // Enhance with AI analysis
  const scoredWithAI = await Promise.all(
    baseScoredSuppliers.map(async item => {
      try {
        const aiFeedback = await generateSupplierFeedback(
          item.supplier, 
          material, 
          quantity, 
          priority,
          additionalRequirements
        );
        
        return {
          ...item,
          score: item.score + (aiFeedback.scoreAdjustment || 0),
          aiFeedback: aiFeedback.feedback
        };
      } catch (error) {
        console.error("AI feedback failed for supplier:", item.supplier.name, error);
        return item; // Return without AI enhancement
      }
    })
  );

  return scoredWithAI.sort((a, b) => b.score - a.score);
}

/**
 * Calculates base supplier score
 */
function calculateBaseScore(supplier, materialData, priority) {
  // Normalize values to prevent division by zero
  const cost = Math.max(materialData.cost, 0.01);
  const deliveryTime = Math.max(supplier.deliveryTime, 1);
  const distance = Math.max(supplier.distance, 1);
  
  // Calculate weights based on priority
  let costWeight, deliveryWeight, ratingWeight, distanceWeight, perfWeight;
  
  switch(priority) {
    case 'cost':
      costWeight = 0.4;
      deliveryWeight = 0.3;
      ratingWeight = 0.2;
      distanceWeight = 0.1;
      perfWeight = 0;
      break;
    case 'speed':
      costWeight = 0.2;
      deliveryWeight = 0.5;
      ratingWeight = 0.3;
      distanceWeight = 0;
      perfWeight = 0;
      break;
    case 'quality':
      costWeight = 0.2;
      deliveryWeight = 0;
      ratingWeight = 0.5;
      distanceWeight = 0;
      perfWeight = 0.3;
      break;
    default: // balanced
      costWeight = 0.3;
      deliveryWeight = 0.3;
      ratingWeight = 0.2;
      distanceWeight = 0.1;
      perfWeight = 0.1;
  }

  // Calculate score components
  const costScore = (1 / cost) * costWeight * 100;
  const deliveryScore = (1 / deliveryTime) * deliveryWeight * 100;
  const ratingScore = supplier.supplierRating * ratingWeight * 20; // 5*20=100
  const distanceScore = (1 / distance) * distanceWeight * 100;
  const perfScore = (supplier.historicalPerformance / 100) * perfWeight * 100;

  return costScore + deliveryScore + ratingScore + distanceScore + perfScore;
}

/**
 * Generates AI feedback for suppliers
 */
async function generateSupplierFeedback(supplier, material, quantity, priority, additionalRequirements) {
  if (!openai) {
    return {
      scoreAdjustment: 0,
      feedback: "AI analysis unavailable"
    };
  }

  try {
    const prompt = `Analyze this supplier for ${quantity} units of ${material}:
    - Supplier: ${supplier.name}
    - Priority: ${priority}
    - Additional Requirements: ${additionalRequirements || 'None'}
    - Rating: ${supplier.supplierRating}/5
    - Historical Performance: ${supplier.historicalPerformance}/100
    - Delivery Time: ${supplier.deliveryTime} days
    - Distance: ${supplier.distance} km
    
    Provide:
    1. Score adjustment (-10 to +10) based on qualitative factors
    2. Concise feedback highlighting key strengths/weaknesses
    
    Return JSON with "scoreAdjustment" and "feedback" properties.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in response");

    const result = safeJsonParse(content);
    if (!result || typeof result.scoreAdjustment !== 'number' || !result.feedback) {
      throw new Error("Invalid response format");
    }

    // Clamp score adjustment
    result.scoreAdjustment = Math.max(-10, Math.min(10, result.scoreAdjustment));
    
    return result;
  } catch (error) {
    console.error("Supplier feedback error:", error);
    return {
      scoreAdjustment: 0,
      feedback: "AI analysis failed"
    };
  }
}

/**
 * Gets AI-enhanced Alibaba suggestions
 */
async function getAIEnhancedAlibabaSuggestions(material, quantity, priority, additionalRequirements) {
  try {
    const rawResults = await getRawAlibabaResults(material, quantity);
    if (!rawResults || rawResults.length === 0) return [];

    const prompt = `Analyze these suppliers for ${quantity} units of ${material}:
    - Priority: ${priority}
    - Additional Requirements: ${additionalRequirements || 'None'}
    
    Suppliers:
    ${JSON.stringify(rawResults.slice(0, 5), null, 2)}
    
    Return top 3 as JSON array with these properties per supplier:
    - supplier: Name
    - minOrder: Minimum order
    - price: Formatted price
    - rating: Supplier rating
    - deliveryTime: Estimated delivery
    - link: Product URL
    - aiAssessment: Brief assessment`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in response");

    const result = safeJsonParse(content);
    if (!result || !Array.isArray(result.suppliers)) {
      throw new Error("Invalid response format");
    }

    return result.suppliers.slice(0, 3).map(s => ({
      ...s,
      isExternal: true,
      source: "Alibaba"
    }));
  } catch (error) {
    console.error("Alibaba suggestions error:", error);
    return [];
  }
}

/**
 * Gets raw Alibaba results (mock implementation)
 */
async function getRawAlibabaResults(material, quantity) {
  // Mock data - in production, replace with actual Alibaba API calls
  return [
    {
      supplier: "Global Materials Inc.",
      minOrder: "100 kg",
      price: "$1.20/kg",
      rating: "4.5/5",
      deliveryTime: "15 days",
      link: "https://www.alibaba.com/product-detail/Global-Materials-Inc_12345.html",
      reviews: 42,
      transactionLevel: "Gold Supplier",
      responseRate: "98%"
    },
    {
      supplier: "International Suppliers Co.",
      minOrder: "500 kg",
      price: "$1.05/kg",
      rating: "4.2/5",
      deliveryTime: "20 days",
      link: "https://www.alibaba.com/product-detail/International-Suppliers-Co_67890.html",
      reviews: 28,
      transactionLevel: "Verified Supplier",
      responseRate: "95%"
    },
    {
      supplier: "Premium Materials Ltd.",
      minOrder: "200 kg",
      price: "$1.35/kg",
      rating: "4.7/5",
      deliveryTime: "10 days",
      link: "https://www.alibaba.com/product-detail/Premium-Materials-Ltd_13579.html",
      reviews: 65,
      transactionLevel: "Gold Supplier",
      responseRate: "99%"
    }
  ].filter(supplier => {
    const minOrder = parseInt(supplier.minOrder);
    return !isNaN(minOrder) && minOrder <= quantity;
  });
}

/**
 * Generates AI summary of recommendations
 */
async function generateAISummary(suppliers, material, quantity) {
  if (!suppliers || suppliers.length === 0 || !openai) return "";

  try {
    const prompt = `Summarize why these suppliers were recommended for ${quantity} units of ${material}:
    ${suppliers.map(s => `- ${s.supplierName}: ${s.aiFeedback}`).join('\n')}
    
    Provide a concise 2-3 sentence summary focusing on key differentiators.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 150
    });

    return response.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Summary generation error:", error);
    return "";
  }
}

/**
 * Safely parses JSON with error handling
 */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("JSON parse error:", error);
    return null;
  }
}