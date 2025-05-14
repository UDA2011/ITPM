import React, { useState, useEffect, useContext } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AddEnd from "../components/AddEnd";
import EditEnd from "../components/EditEnd";
import AuthContext from "../AuthContext";

function EndProducts() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [products, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchProductsData();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProductsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/endproducts`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setAllProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/endproducts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const downloadFile = () => {
    if (filteredProducts.length === 0) {
      alert("No data available to generate PDF");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Report Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("End Products Inventory Report", 14, 20);

    // Report Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Items: ${filteredProducts.length}`, 14, 34);

    // Summary Statistics
    const totalQuantity = filteredProducts.reduce(
      (sum, p) => sum + (parseInt(p.quantity) || 0),
      0
    );
    const totalValue = filteredProducts
      .reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0)
      .toFixed(2);

    doc.setFontSize(10);
    autoTable(doc, {
      startY: 40,
      body: [
        ["Total Quantity (Units)", totalQuantity],
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

    // Main Inventory Table
    const headers = [
      "S/N",
      "Product Name",
      "Category",
      "Price (Rs.)",
      "Quantity",
      "Value (Rs.)",
    ];

    const data = filteredProducts.map((product, index) => [
      index + 1,
      product.name || "N/A",
      product.category || "N/A",
      product.price ? Number(product.price).toFixed(2) : "0.00",
      `${product.quantity || 0} units`,
      product.value ? Number(product.value).toFixed(2) : "0.00",
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
        0: { cellWidth: 25 }, // S/N
        1: { cellWidth: 25 }, // Product Name
        2: { cellWidth: 25 }, // Category
        3: { cellWidth: 25 }, // Price
        4: { cellWidth: 25 }, // Quantity
        5: { cellWidth: 25 }, // Value
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

    // Final Notes
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Notes:", 14, finalY);
    doc.text("• This report is for internal use only.", 14, finalY + 5);
    doc.text("• All values are in Sri Lankan Rupees (Rs.).", 14, finalY + 10);
    doc.text("• Quantities are accurate as of the report generation time.", 14, finalY + 15);

    doc.save(`End_Products_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-6 w-full max-w-7xl">
        <div className="bg-white rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">End Product Items</h2>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by name or category"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search products"
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
                  onClick={() => setShowProductModal(true)}
                  aria-label="Add new product"
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
                  Add Product
                </button>
                <button
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
                  onClick={downloadFile}
                  aria-label="Download PDF report"
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
                aria-label="Clear search"
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

          {error && (
            <div className="text-red-600 text-center mb-4">{error}</div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">S/N</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Value</th>
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
                        <td className="px-6 py-4 text-sm text-gray-600 w-1/6 truncate">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 w-1/6 truncate">{product.name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 w-1/6 truncate">{product.category || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 w-1/6 truncate">
                          Rs. {product.price ? Number(product.price).toFixed(2) : "0.00"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 w-1/6 truncate">
                          {product.quantity || 0} units
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 w-1/6 truncate">
                          Rs. {product.value ? Number(product.value).toFixed(2) : "0.00"}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm transition-all duration-300"
                            onClick={() => {
                              setUpdateProduct(product);
                              setShowUpdateModal(true);
                            }}
                            aria-label={`Edit ${product.name || "product"}`}
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
                            onClick={() => deleteItem(product._id)}
                            aria-label={`Delete ${product.name || "product"}`}
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
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-500 text-lg"
                      >
                        {searchTerm
                          ? "No items found matching your search"
                          : "No products available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <AddEnd
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
            setUpdatePage={() => setRefreshTrigger((prev) => prev + 1)}
          />
          <EditEnd
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            product={updateProduct}
            onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </div>
      </div>
    </div>
  );
}

export default EndProducts;