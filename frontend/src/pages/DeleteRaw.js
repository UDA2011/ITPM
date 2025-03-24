import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../AuthContext";

function DeleteRaw() {
  const [product, setProduct] = useState(null);
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

  const deleteProduct = () => {
    fetch(`http://localhost:4000/api/product/delete/${productId}`, {
      method: "DELETE",
    })
      .then(() => {
        navigate("/inventory");
      })
      .catch((err) => console.log(err));
  };

  const goBack = () => {
    navigate("/inventory");
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Are you sure you want to delete this raw material?</h2>
        <div className="mb-4">
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Quantity:</strong> {product.quantity}</p>
          <p><strong>Value:</strong> ${product.value}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={deleteProduct}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
          <button
            onClick={goBack}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteRaw;
