import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AddProduct from "../components/AddProduct";
import EditRaw from "../components/EditRaw";
import RequestModal from "../components/RequestModal";
import AuthContext from "../AuthContext";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedSection, setSelectedSection] = useState("raw");
  const [requestItems, setRequestItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductsData();
  }, [updatePage, selectedSection]);

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/inventory?type=${selectedSection}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.log(err));
  };

  const updateProductStatus = async (id, newStatus) => {
    const updatedProducts = products.map(product => 
      product._id === id ? {...product, status: newStatus} : product
    );
    setAllProducts(updatedProducts);
    setFilteredProducts(updatedProducts);

    try {
      await fetch(`http://localhost:4000/api/inventory/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.log(err);
      setUpdatePage(prev => !prev);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase()) ||
        product._id.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  const updateProductModalSetting = (selectedProductData) => {
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/inventory/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      setUpdatePage(prev => !prev);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const downloadPDF = () => {
    if (filteredProducts.length === 0) {
      alert("No data available to generate PDF");
      return;
    }

    const doc = new jsPDF();
    
    const title = `${selectedSection === "raw" ? "Raw Material" : "End Product"} Inventory Report`;
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    const headers = [
      "S/N",
      "Name", 
      "Category", 
      "Price (Rs.)", 
      "Quantity", 
      "Value (Rs.)", 
      "Status"
    ];
    
    const data = filteredProducts.map((product, index) => [
      index + 1,
      product.name,
      product.category,
      product.price,
      `${product.quantity} ${selectedSection === "raw" ? "kg" : "units"}`,
      product.value,
      product.status === "out_of_stock"
        ? "Out of Stock"
        : product.status === "low_stock"
          ? "Low Stock"
          : "In Stock"
    ]);
    

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 35 }
      }
    });

    doc.save(`${selectedSection === "raw" ? "Raw_Materials" : "End_Products"}_Inventory_Report.pdf`);
  };

  const prepareRequest = () => {
    const itemsToRequest = products.filter(
      p => p.status === "low_stock" || p.status === "out_of_stock"
    );
    
    if (itemsToRequest.length === 0) {
      alert("No items need to be requested currently");
      return;
    }
    
    const initialQuantities = {};
    itemsToRequest.forEach(item => {
      initialQuantities[item._id] = item.status === "out_of_stock" ? 10 : 5;
    });
    
    setQuantities(initialQuantities);
    setRequestItems(itemsToRequest);
    setShowRequestModal(true);
  };

  

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {selectedSection === "raw" && (
          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">Raw Material Status</h2>
              <button
                onClick={prepareRequest}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
              >
                {/* Upward-pointing arrowhead (triangle) */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M10 7l-5 5h10l-5-5z" />
                </svg>
                Send Request
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800">Total Items</h3>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="font-semibold text-yellow-800">Low Stock</h3>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.status === "low_stock").length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-800">Out of Stock</h3>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.status === "out_of_stock").length}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col gap-4 mb-4">
            <h2 className="font-bold text-lg">
              {selectedSection === "raw" ? "Raw Material Items" : "End Product Items"}
            </h2>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder={`Search ${selectedSection === "raw" ? "by name or category" : "products"}`}
                  className="w-full p-2 border rounded-lg pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                  onClick={addProductModalSetting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add {selectedSection === "raw" ? "Material" : "Product"}
                </button>
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                  onClick={downloadPDF}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {searchTerm && (
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} items
              </p>
              <button 
                className="text-blue-500 text-sm flex items-center gap-1"
                onClick={() => {
                  setSearchTerm("");
                  setFilteredProducts(products);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Search
              </button>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">s/n</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Category</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Quantity</th>
                  <th className="border px-4 py-2">Value</th>
                  <th className="border px-4 py-2 w-32">Status</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{product.name}</td>
                      <td className="border px-4 py-2">{product.category}</td>
                      <td className="border px-4 py-2">Rs. {product.price}</td>
                      <td className="border px-4 py-2">{product.quantity} {selectedSection === "raw" ? "units" : "units"}</td>
                      <td className="border px-4 py-2">Rs. {product.value}</td>
                      <td className="border px-4 py-2">
                        <select
                          value={product.status || "in_stock"}
                          onChange={(e) => updateProductStatus(product._id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs ${
                            product.status === "out_of_stock" 
                              ? "bg-red-100 text-red-800" 
                              : product.status === "low_stock" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </td>
                      <td className="border px-4 py-2 flex gap-2">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1"
                          onClick={() => updateProductModalSetting(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                          onClick={() => deleteProduct(product._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="border px-4 py-6 text-center text-gray-500">
                      {searchTerm 
                        ? "No items found matching your search" 
                        : "No inventory items available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <RequestModal
          showRequestModal={showRequestModal}
          setShowRequestModal={setShowRequestModal}
          requestItems={requestItems}
          quantities={quantities}
          setQuantities={setQuantities}
        />

        {showProductModal && (
          <AddProduct
            addProductModalSetting={addProductModalSetting}
            updatePage={updatePage}
            setUpdatePage={setUpdatePage}
            productType={selectedSection}
          />
        )}
        {showUpdateModal && (
          <EditRaw
            updateProduct={updateProduct}
            setShowUpdateModal={setShowUpdateModal}
            refreshData={() => setUpdatePage(prev => !prev)}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Inventory;