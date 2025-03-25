import React, { useState, useEffect } from "react";

function EditEnd({ updateProductData, closeModal, updatePage }) {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    value: "",
  });

  useEffect(() => {
    if (updateProductData) {
      setProduct({
        name: updateProductData.name || "",
        category: updateProductData.category || "",
        price: updateProductData.price || "",
        quantity: updateProductData.quantity || "",
        value: updateProductData.value || "",
      });
    }
  }, [updateProductData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:4000/api/endproducts/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })
      .then((response) => response.json())
      .then(() => {
        updatePage();
        closeModal();
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit End Product</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={product.quantity}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="value">
              Value
            </label>
            <input
              type="number"
              id="value"
              name="value"
              value={product.value}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEnd;