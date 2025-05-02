// controllers/supplierSelection.js
const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");
const axios = require("axios");
const cheerio = require("cheerio");

// Find best supplier from database
exports.findBestSupplier = async (req, res) => {
  try {
    const { material, quantity, priority } = req.body;
    
    // Validate input
    if (!material || !quantity) {
      return res.status(400).json({ 
        message: "Material and quantity are required" 
      });
    }

    // Find suppliers that offer the requested material
    const potentialSuppliers = await Supplier.find({
      materials: {
        $elemMatch: {
          name: material,
          availableQuantity: { $gte: quantity }
        }
      }
    });

    if (potentialSuppliers.length === 0) {
      // No suppliers found in database - will suggest from Alibaba
      return res.status(200).json({
        message: "No matching suppliers found in database",
        suggestions: [],
        alibabaSuggestions: await getAlibabaSuggestions(material)
      });
    }

    // Score suppliers based on criteria
    const scoredSuppliers = potentialSuppliers.map(supplier => {
      const materialData = supplier.materials.find(m => m.name === material);
      
      // Calculate score based on different factors
      let score = 0;
      
      // Different scoring based on priority
      switch(priority) {
        case 'cost':
          score = (1 / materialData.cost) * 40 + 
                  (1 / supplier.deliveryTime) * 30 +
                  supplier.supplierRating * 20 +
                  (1 / supplier.distance) * 10;
          break;
        case 'speed':
          score = (1 / supplier.deliveryTime) * 50 +
                  supplier.supplierRating * 30 +
                  (1 / materialData.cost) * 20;
          break;
        case 'quality':
          score = supplier.supplierRating * 50 +
                  supplier.historicalPerformance * 30 +
                  (1 / materialData.cost) * 20;
          break;
        default: // balanced approach
          score = (1 / materialData.cost) * 30 +
                  (1 / supplier.deliveryTime) * 30 +
                  supplier.supplierRating * 20 +
                  (1 / supplier.distance) * 10 +
                  supplier.historicalPerformance * 10;
      }
      
      return {
        supplier: supplier,
        materialData: materialData,
        score: score
      };
    });

    // Sort suppliers by score (descending)
    scoredSuppliers.sort((a, b) => b.score - a.score);

    // Get top 3 suggestions
    const topSuggestions = scoredSuppliers.slice(0, 3).map(item => ({
      supplierId: item.supplier._id,
      supplierName: item.supplier.name,
      contact: item.supplier.contact,
      email: item.supplier.email,
      cost: item.materialData.cost,
      deliveryTime: item.supplier.deliveryTime,
      rating: item.supplier.supplierRating,
      availableQuantity: item.materialData.availableQuantity,
      score: item.score
    }));

    res.status(200).json({
      message: "Found matching suppliers",
      suggestions: topSuggestions,
      alibabaSuggestions: [] // Only show Alibaba if no local suppliers
    });

  } catch (error) {
    console.error("Error finding supplier:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Error while searching for suppliers" 
    });
  }
};

// Get suggestions from Alibaba
async function getAlibabaSuggestions(material) {
  try {
    // Note: In a real implementation, you would use Alibaba's API
    // This is a simplified version that would need proper API integration
    
    // For demonstration, we'll simulate API response
    const mockAlibabaResults = [
      {
        supplier: "Global Materials Inc.",
        minOrder: "100 kg",
        price: "$1.20/kg",
        rating: "4.5/5",
        deliveryTime: "15 days",
        link: "https://www.alibaba.com/product-detail/Global-Materials-Inc_12345.html"
      },
      {
        supplier: "International Suppliers Co.",
        minOrder: "500 kg",
        price: "$1.05/kg",
        rating: "4.2/5",
        deliveryTime: "20 days",
        link: "https://www.alibaba.com/product-detail/International-Suppliers-Co_67890.html"
      },
      {
        supplier: "Premium Materials Ltd.",
        minOrder: "200 kg",
        price: "$1.35/kg",
        rating: "4.7/5",
        deliveryTime: "10 days",
        link: "https://www.alibaba.com/product-detail/Premium-Materials-Ltd_13579.html"
      }
    ];
    
    return mockAlibabaResults;
    
    /* 
    // Actual API implementation would look something like this:
    const response = await axios.get(`https://api.alibaba.com/search`, {
      params: {
        query: material,
        sort: 'price_asc',
        min_order: '100',
        // other parameters
      },
      headers: {
        'Authorization': `Bearer YOUR_ALIBABA_API_KEY`
      }
    });
    
    return response.data.results.map(item => ({
      supplier: item.supplierName,
      minOrder: item.minOrderQuantity,
      price: item.price,
      rating: item.rating,
      deliveryTime: item.deliveryTime,
      link: item.productUrl
    }));
    */
    
  } catch (error) {
    console.error("Error fetching Alibaba suggestions:", error);
    return []; // Return empty array if Alibaba search fails
  }
}