import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AddProduct from "../components/AddProduct";
import EditRaw from "../components/EditRaw";
import AuthContext from "../AuthContext";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedSection, setSelectedSection] = useState("raw");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductsData();
  }, [updatePage, selectedSection]);

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/inventory`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  const updateProductModalSetting = (selectedProductData) => {
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(true); // Always set to true when opening
  };

  const deleteProduct = (id) => {
    fetch(`http://localhost:4000/api/inventory/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setUpdatePage(!updatePage);
      })
      .catch((err) => console.log(err));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`${selectedSection === "raw" ? "Raw Material" : "End Product"} Inventory`, 14, 10);

    const tableColumn = ["s/n", "Name", "Category", "Price", "Quantity", "Value"];
    const tableRows = [];

    products.forEach((product, index) => {
      const rowData = [
        index + 1,
        product.name,
        product.manufacturer,
        `$${product.price}`,
        product.stock,
        `$${product.value}`,
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`${selectedSection === "raw" ? "Raw_Material" : "End_Product"}_Inventory_Report.pdf`);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        
        {/* Sidebar Section */}
        <div className="flex justify-start gap-4 mb-4">
          <button
            onClick={() => setSelectedSection("raw")}
            className={`${
              selectedSection === "raw" ? "bg-blue-500" : "bg-gray-300"
            } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
          >
            Raw Materials
          </button>
          <button
            onClick={() => setSelectedSection("end")}
            className={`${
              selectedSection === "end" ? "bg-blue-500" : "bg-gray-300"
            } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
          >
            End Products
          </button>
        </div>

        {/* Raw Material Status Section */}
        {selectedSection === "raw" && (
          <div className="bg-white rounded p-3">
            <h2 className="font-bold text-lg">Raw Material Status</h2>
            <div className="bg-red-500 text-white rounded-md p-2 flex justify-between items-center">
              <div>
                <span className="font-semibold text-lg">Out of Stock</span>
                <div className="text-3xl font-bold">
                  {products.filter((product) => product.stock === 0).length}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-white text-red-500 border border-red-500 font-bold py-1 px-4 text-xs rounded">
                  View
                </button>
                <button className="bg-white text-red-500 border border-red-500 font-bold py-1 px-4 text-xs rounded">
                  Request Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-bold text-lg mb-2">
            {selectedSection === "raw" ? "Raw Material Items" : "End Product Items"}
          </h2>

          <div className="flex justify-between items-center mb-3">
            <input
              type="text"
              placeholder="Search by name"
              className="border p-2 rounded-md text-sm w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                onClick={addProductModalSetting}
              >
                Add {selectedSection === "raw" ? "Material" : "Product"}
              </button>
              <button
                className="bg-green-500 text-white font-bold py-2 px-4 rounded"
                onClick={downloadPDF}
              >
                Download PDF
              </button>
            </div>
          </div>

          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">s/n</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Value</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">{product.category}</td>
                  <td className="border px-4 py-2">{product.price}</td>
                  <td className="border px-4 py-2">{product.quantity}</td>
                  <td className="border px-4 py-2">{product.value}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => navigate(`/view-product/${product._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => updateProductModalSetting(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {showProductModal && (
        <AddProduct 
          addProductModalSetting={addProductModalSetting} 
          updatePage={() => setUpdatePage(!updatePage)}
        />
      )}
        {showUpdateModal && (
          <EditRaw 
            updateProductData={updateProduct} 
            closeModal={() => setShowUpdateModal(false)}
            updatePage={() => setUpdatePage(!updatePage)}
          />
        )}
      </div>
    </div>
  );
}

export default Inventory;
