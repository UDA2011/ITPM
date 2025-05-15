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
    const updatedProducts = products.map((product) =>
      product._id === id ? { ...product, status: newStatus } : product
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
      setUpdatePage((prev) => !prev);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
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
        throw new Error("Failed to delete product");
      }

      setUpdatePage((prev) => !prev);
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    const title = `${
      selectedSection === "raw" ? "Raw Material" : "End Product"
    } Inventory Report`;
    doc.text(title, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Items: ${filteredProducts.length}`, 14, 34);

    const inStock = filteredProducts.filter((p) => p.status === "in_stock").length;
    const lowStock = filteredProducts.filter((p) => p.status === "low_stock").length;
    const outOfStock = filteredProducts.filter((p) => p.status === "out_of_stock").length;
    const totalValue = filteredProducts
      .reduce((sum, p) => sum + parseFloat(p.value || 0), 0)
      .toFixed(2);

    doc.setFontSize(10);
    autoTable(doc, {
      startY: 40,
      body: [
        ["In Stock", inStock],
        ["Low Stock", lowStock],
        ["Out of Stock", outOfStock],
        ["Total Inventory Value (Rs.)", totalValue],
      ],
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 2,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
      },
    });

    const headers = [
      "S/N",
      "Name",
      "Category",
      "Price (Rs.)",
      "Quantity",
      "Value (Rs.)",
      "Status",
    ];

    const data = filteredProducts.map((product, index) => [
      index + 1,
      product.name,
      product.category,
      parseFloat(product.price).toFixed(2),
      `${product.quantity} ${selectedSection === "raw" ? "kg" : "units"}`,
      parseFloat(product.value).toFixed(2),
      product.status === "out_of_stock"
        ? "Out of Stock"
        : product.status === "low_stock"
        ? "Low Stock"
        : "In Stock",
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: doc.lastAutoTable.finalY + 10,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 35 },
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageCount = doc.internal.getNumberOfPages();
        const pageNumber = data.pageNumber;
        doc.text(`Page ${pageNumber} of ${pageCount}`, 190, 285, { align: "right" });
        doc.text("Generated by Inventory Management System", 14, 285);
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Notes:", 14, finalY);
    doc.text("• This report is for internal use only.", 14, finalY + 5);
    doc.text("• All values are in Sri Lankan Rupees (Rs.).", 14, finalY + 10);
    doc.text("• Quantities are accurate as of the report generation time.", 14, finalY + 15);

    doc.save(
      `${
        selectedSection === "raw" ? "Raw_Materials" : "End_Products"
      }_Inventory_Report.pdf`
    );
  };

  const prepareRequest = () => {
    const itemsToRequest = products.filter(
      (p) => p.status === "low_stock" || p.status === "out_of_stock"
    );

    if (itemsToRequest.length === 0) {
      alert("No items need to be requested currently");
      return;
    }

    const initialQuantities = {};
    itemsToRequest.forEach((item) => {
      initialQuantities[item._id] = item.status === "out_of_stock" ? 10 : 5;
    });

    setQuantities(initialQuantities);
    setRequestItems(itemsToRequest);
    setShowRequestModal(true);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-6 w-full max-w-7xl">
        {/* Raw Material Status Section */}
        {selectedSection === "raw" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Raw Material Status</h2>
              <button
                onClick={prepareRequest}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
              >
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col items-center transition-transform duration-300 hover:scale-105">
                <h3 className="font-medium text-blue-700">Total Items</h3>
                <p className="text-3xl font-bold text-blue-800">{products.length}</p>
              </div>
              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 flex flex-col items-center transition-transform duration-300 hover:scale-105">
                <h3 className="font-medium text-yellow-700">Low Stock</h3>
                <p className="text-3xl font-bold text-yellow-800">
                  {products.filter((p) => p.status === "low_stock").length}
                </p>
              </div>
              <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex flex-col items-center transition-transform duration-300 hover:scale-105">
                <h3 className="font-medium text-red-700">Out of Stock</h3>
                <p className="text-3xl font-bold text-red-800">
                  {products.filter((p) => p.status === "out_of_stock").length}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Inventory Table Section */}
        <div className="bg-white rounded-2xl border p-6 shadow-lg">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {selectedSection === "raw" ? "Raw Material Items" : "End Product Items"}
            </h2>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder={`Search ${
                    selectedSection === "raw" ? "by name or category" : "products"
                  }`}
                  className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
                  onClick={addProductModalSetting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add {selectedSection === "raw" ? "Material" : "Product"}
                </button>
                <button
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
                  onClick={downloadPDF}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {searchTerm && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} items
              </p>
              <button
                className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800 transition-colors duration-300"
                onClick={() => {
                  setSearchTerm("");
                  setFilteredProducts(products);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Search
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">S/N</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Rs. {product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity} {selectedSection === "raw" ? "kg" : "units"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Rs. {product.value}</td>
                      <td className="px-6 py-4">
                        <select
                          value={product.status || "in_stock"}
                          onChange={(e) => updateProductStatus(product._id, e.target.value)}
                          className={`w-28 px-2 py-1 rounded text-xs font-medium ${
                            product.status === "out_of_stock"
                              ? "bg-red-100 text-red-800"
                              : product.status === "low_stock"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm transition-all duration-300"
                          onClick={() => updateProductModalSetting(product)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm transition-all duration-300"
                          onClick={() => deleteProduct(product._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-8 text-center text-gray-500 text-lg"
                    >
                      {searchTerm
                        ? "No items found matching your search"
                        : "No inventory items available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              refreshData={() => setUpdatePage((prev) => !prev)}
              onClose={() => setShowUpdateModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory;