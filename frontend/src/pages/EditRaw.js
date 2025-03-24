import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../AuthContext";

function EditRaw() {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    value: "",
  });
  const { productId } = useParams();
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = () => {
    fetch(`http://localhost:4000/api/product/getById/${productId}`)
      .then((response) => response.json())
      .then((data) => setProduct(data))
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProductDetails();
  };

  const updateProductDetails = () => {
    fetch(`http://localhost:4000/api/product/update/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })
      .then(() => {
        navigate("/inventory");
      })
      .catch((err) => console.log(err));
  };

  const goBack = () => {
    navigate("/inventory");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Edit Raw Material</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={product.quantity}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Value</label>
            <input
              type="number"
              name="value"
              value={product.value}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Changes
            </button>
            <button
              type="button"
              onClick={goBack}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRaw;
