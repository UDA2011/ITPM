import React, { useState, useEffect } from "react";

function EditEnd({ isOpen, onClose, product, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    value: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    quantity: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        quantity: product.quantity || "",
        value: product.value || ""
      });
    }
    setSubmitError(null); // Reset error when product changes
  }, [product]);

  const validateName = (value) => {
    if (!value) return "Product name is required";
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      return "Product name should contain only letters";
    }
    if (value.length > 20) {
      return "Product name should be max 20 characters";
    }
    return "";
  };

  const validateNumber = (value, fieldName) => {
    if (value === "") return `${fieldName} is required`;
    if (isNaN(value)) return `${fieldName} must be a number`;
    if (value < 0) return `${fieldName} must be positive`;
    if (value.toString().length > 7) {
      return `${fieldName} should be max 7 digits`;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation
    let error = "";
    if (name === "name") {
      error = validateName(value);
    } else if (name === "price" || name === "quantity") {
      error = validateNumber(value, name.charAt(0).toUpperCase() + name.slice(1));
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const priceError = validateNumber(formData.price, "Price");
    const quantityError = validateNumber(formData.quantity, "Quantity");
    
    if (nameError || priceError || quantityError) {
      setErrors({
        name: nameError,
        price: priceError,
        quantity: quantityError
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/endproducts/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      const updatedProduct = await response.json();
      onUpdate(updatedProduct); // Update parent component state
      onClose(); // Close the modal
    } catch (err) {
      console.error("Update error:", err);
      setSubmitError(err.message || "Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit End Product</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Product Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.name ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
              maxLength={20}
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
              required
            >
              <option value="">Select a category</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Antiparasitics">Antiparasitics</option>
              <option value="Pain Relievers">Pain Relievers</option>
              <option value="Vitamins">Vitamins</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.price ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
              min="0"
              step="0.01"
            />
            {errors.price && (
              <p className="text-red-500 text-xs italic mt-1">{errors.price}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
              Quantity*
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.quantity ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
              min="0"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs italic mt-1">{errors.quantity}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="value">
              Value*
            </label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEnd;