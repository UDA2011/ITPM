import React, { useState, useEffect } from "react";

function EditRaw({ updateProduct, setShowUpdateModal, refreshData, onClose }) {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    value: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    quantity: "",
    value: ""
  });

  const categories = [
    "Excipients",
    "Active Pharmaceutical Ingredients",
    "Solvents & Diluents",
    "Additives & Enhancers"
  ];

  useEffect(() => {
    if (updateProduct) {
      setProduct({
        name: updateProduct.name || "",
        category: updateProduct.category || "",
        price: updateProduct.price?.toString() || "",
        quantity: updateProduct.quantity?.toString() || "",
        value: updateProduct.value?.toString() || "",
      });
    }
  }, [updateProduct]);

  const validateName = (value) => {
    const lettersOnly = /^[A-Za-z\s]+$/;
    if (!value.trim()) return "Name is required";
    if (!lettersOnly.test(value)) return "Only letters and spaces allowed";
    return "";
  };

  const validatePrice = (value) => {
    if (!value) return "Price is required";
    
    const priceRegex = /^\d{1,6}(\.\d{2})?$/;
    if (!priceRegex.test(value)) {
      return "Format: up to 6 digits and 2 decimals (e.g., 123456.78)";
    }
    
    if (parseFloat(value) < 0) return "Price cannot be negative";
    
    return "";
  };

  const validateQuantity = (value) => {
    if (!value) return "Quantity is required";
    if (isNaN(value)) return "Must be a whole number";
    if (value.includes('.')) return "Decimal points not allowed";
    if (value.toString().length > 4) return "Maximum 4 digits allowed";
    if (parseInt(value) < 0) return "Cannot be negative";
    return "";
  };

  const calculateValue = (price, quantity) => {
    if (price && quantity) {
      return (parseFloat(price) * parseInt(quantity)).toFixed(2);
    }
    return "";
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const error = validatePrice(value);
    setErrors(prev => ({ ...prev, price: error }));
    
    if (error === "" || value === "") {
      const updatedProduct = {
        ...product,
        price: value
      };
      
      if (updatedProduct.quantity) {
        updatedProduct.value = calculateValue(value, updatedProduct.quantity);
      }
      
      setProduct(updatedProduct);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const error = validateQuantity(value);
    setErrors(prev => ({ ...prev, quantity: error }));
    
    if (error === "" || value === "") {
      const updatedProduct = {
        ...product,
        quantity: value
      };
      
      if (updatedProduct.price) {
        updatedProduct.value = calculateValue(updatedProduct.price, value);
      }
      
      setProduct(updatedProduct);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "name") {
      const error = validateName(value);
      setErrors(prev => ({ ...prev, [name]: error }));
      if (error === "" || value === "") {
        setProduct(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    if (name === "category") {
      setProduct(prev => ({ ...prev, [name]: value }));
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = validateName(product.name);
    const priceError = validatePrice(product.price);
    const quantityError = validateQuantity(product.quantity);
    
    setErrors({
      name: nameError,
      price: priceError,
      quantity: quantityError
    });
    
    if (nameError || priceError || quantityError) {
      return;
    }
    
    try {
      const finalProduct = {
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        value: parseFloat(product.value) || 0
      };
      
      const response = await fetch(`http://localhost:4000/api/inventory/${updateProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalProduct),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      refreshData();
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product. Please try again.");
    }
  };

  const isFormValid = () => {
    return (
      product.name &&
      product.category &&
      product.price &&
      product.quantity &&
      !errors.name &&
      !errors.price &&
      !errors.quantity
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit {updateProduct?.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name}
              onChange={handleChange}
              className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price (Rs.)
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={product.price}
              onChange={handlePriceChange}
              className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              placeholder="e.g. 1234.56"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
              Quantity
            </label>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={product.quantity}
              onChange={handleQuantityChange}
              className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              placeholder="e.g. 100"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="value">
              Value (Rs.) (Auto-calculated)
            </label>
            <input
              type="text"
              id="value"
              name="value"
              value={product.value}
              readOnly
              className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
              disabled={!isFormValid()}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRaw;