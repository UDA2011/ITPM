// src/pages/ViewProduct.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
import { useContext } from "react";

const ViewProduct = () => {
  const { id } = useParams(); // Retrieve the product ID from the URL parameter
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/product/${id}`);
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setLoading(false);
    }
  };

  const handleBackButton = () => {
    navigate("/inventory"); // Redirect back to the inventory page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center">
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-5">
      <div className="w-3/4 bg-white p-6 rounded-lg shadow-md">
        <button
          onClick={handleBackButton}
          className="bg-blue-500 text-white py-2 px-4 rounded-md mb-4"
        >
          Back to Inventory
        </button>
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Category</h3>
            <p>{product.manufacturer}</p>
          </div>
          <div>
            <h3 className="font-semibold">Price</h3>
            <p>${product.price}</p>
          </div>
          <div>
            <h3 className="font-semibold">Quantity</h3>
            <p>{product.stock}</p>
          </div>
          <div>
            <h3 className="font-semibold">Value</h3>
            <p>${product.value}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold">Description</h3>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
