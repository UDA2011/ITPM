import React, { useState, useEffect, useContext } from "react";
import AddStore from "../components/product"; // Make sure this component is correctly handling product addition
import AuthContext from "../AuthContext";
import locationIcon from "../assets/location-icon.png"; // Importing instead of require()

function Store() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.user) {
      fetchData();
    }
  }, [authContext.user]); // Added dependency to re-fetch when user data is available

  // Fetching all products data
  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/addproduct/get/${authContext.user?._id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12 border-2 p-4">
        <div className="flex justify-between">
          <span className="font-bold">Manage Products</span>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
            onClick={toggleModal}
          >
            Add Product
          </button>
        </div>
        {showModal && <AddStore refreshData={fetchData} />} {/* Ensure AddStore correctly updates products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              className="bg-white w-full h-fit flex flex-col gap-4 p-4 shadow-md rounded-lg"
              key={product._id}
            >
              <div>
                <img
                  alt="product"
                  className="h-60 w-full object-cover rounded-md"
                  src={product.image}
                />
              </div>
              <div className="flex flex-col gap-3 justify-between items-start">
                <span className="font-bold text-lg">{product.productname}</span>
                <span className="text-gray-700">{product.description}</span>
                <div className="flex items-center gap-2">
                  <img alt="location-icon" className="h-6 w-6" src={locationIcon} />
                  <span>{product.category}</span>
                </div>
                <span className="text-green-600 font-semibold">${product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Store;
