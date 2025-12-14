import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AuthContext from "../AuthContext";

function EndProducts() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Updated allowed categories exactly as per your latest screenshot
  const allowedCategories = [
    "Antibiotics",
    "Antiparasitics",
    "Pain Relievers",
    "Vitamins",
  ];

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
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const response = await fetch(`http://localhost:4000/api/endproducts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleEditOpen = (product) => {
    setUpdateProduct(product);
    setEditForm({
      name: product.name || "",
      category: product.category || "",
      price: product.price != null ? product.price.toString() : "",
      quantity: product.quantity != null ? product.quantity.toString() : "",
    });
    setShowUpdateModal(true);
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim()) {
      alert("Product name is required.");
      return;
    }
    if (!editForm.category.trim()) {
      alert("Category is required.");
      return;
    }

    const price = parseFloat(editForm.price);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price (≥ 0).");
      return;
    }

    const quantity = parseInt(editForm.quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      alert("Please enter a valid quantity (whole number ≥ 0).");
      return;
    }

    const updatedValue = (price * quantity).toFixed(2);

    try {
      const response = await fetch(`http://localhost:4000/api/endproducts/${updateProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category.trim(),
          price: price,
          quantity: quantity,
          value: parseFloat(updatedValue),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${errorText}`);
      }

      setShowUpdateModal(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update product. Please try again.");
    }
  };

  const handleAddSave = async () => {
    // Name validation
    if (!addForm.name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(addForm.name.trim())) {
      alert("Name can only contain letters and spaces.");
      return;
    }
    if (addForm.name.trim().length > 20) {
      alert("Name cannot exceed 20 characters.");
      return;
    }

    // Category validation
    if (!addForm.category) {
      alert("Please select a category.");
      return;
    }

    // Price validation
    const priceNum = parseFloat(addForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }
    if (addForm.price.length > 10) {
      alert("Price cannot exceed 10 digits.");
      return;
    }

    // Quantity validation
    const quantityNum = parseInt(addForm.quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }
    if (addForm.quantity.length > 10) {
      alert("Quantity cannot exceed 10 digits.");
      return;
    }

    const calculatedValue = (priceNum * quantityNum).toFixed(2);

    try {
      const response = await fetch(`http://localhost:4000/api/endproducts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          category: addForm.category,
          price: priceNum,
          quantity: quantityNum,
          value: parseFloat(calculatedValue),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add product");
      }

      setShowProductModal(false);
      setAddForm({ name: "", category: "", price: "", quantity: "" });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Add error:", err);
      alert(err.message || "Failed to add product. Please try again.");
    }
  };

  const downloadFile = () => {
    if (filteredProducts.length === 0) {
      alert("No data available to generate PDF");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("End Products Inventory Report", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Items: ${filteredProducts.length}`, 14, 34);

    const totalQuantity = filteredProducts.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
    const totalValue = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0).toFixed(2);

    doc.setFontSize(10);
    autoTable(doc, {
      startY: 40,
      body: [
        ["Total Quantity (Units)", totalQuantity],
        ["Total Inventory Value (Rs.)", totalValue],
      ],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2, textColor: [50, 50, 50] },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 30 } },
    });

    const headers = ["S/N", "Product Name", "Category", "Price (Rs.)", "Quantity", "Value (Rs.)"];
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
      styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50], lineColor: [200, 200, 200] },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold", lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, 190, 285, { align: "right" });
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

    doc.save(`End_Products_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Product Details Modal
  const ProductDetailsModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const formatDate = (dateString) => {
      if (!dateString) return "Unknown date";
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const history = product.editHistory || [];
    const recentHistory = history.slice(-5).reverse();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-100">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold">{product.name || "Product Details"}</h2>
                <p className="text-blue-100 mt-1 text-lg">{product.category || "Uncategorized"}</p>
              </div>
              <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
                <p className="text-blue-600 font-medium text-sm">Price per Unit</p>
                <p className="text-4xl font-bold text-blue-800 mt-3">
                  Rs. {product.price ? Number(product.price).toFixed(2) : "0.00"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
                <p className="text-green-600 font-medium text-sm">Current Quantity</p>
                <div className="mt-3">
                  <p className="text-4xl font-bold text-green-800 leading-tight">
                    {product.quantity || 0}
                  </p>
                  <p className="text-green-700 font-medium text-lg -mt-1">units</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
                <p className="text-purple-600 font-medium text-sm">Total Value</p>
                <p className="text-4xl font-bold text-purple-800 mt-3">
                  Rs. {product.value ? Number(product.value).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Edit History
              </h3>
              {recentHistory.length > 0 ? (
                <div className="space-y-4">
                  {recentHistory.map((entry, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {recentHistory.length - index}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">
                              Quantity: <span className="text-indigo-600">{entry.quantity} units</span>
                            </p>
                            <p className="font-medium text-gray-800">
                              Value: <span className="text-purple-600">Rs. {Number(entry.value || 0).toFixed(2)}</span>
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(entry.editedAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8 bg-gray-50 rounded-xl">
                  No edit history available
                </p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Modal (amber theme)
  const ProductEditModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const priceNum = parseFloat(editForm.price) || 0;
    const quantityNum = parseInt(editForm.quantity, 10) || 0;
    const calculatedValue = (priceNum * quantityNum).toFixed(2);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative border border-gray-100">
          <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-3xl p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Edit Product</h2>
              <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-amber-100 text-lg">Update product details</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="">Select a category</option>
                {allowedCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 text-center border-2 border-amber-200">
              <p className="text-amber-700 font-medium text-sm">Total Value</p>
              <p className="text-4xl font-bold text-amber-800 mt-3">
                Rs. {calculatedValue}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Product Modal (blue-indigo theme)
  const AddProductModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const priceNum = parseFloat(addForm.price) || 0;
    const quantityNum = parseInt(addForm.quantity, 10) || 0;
    const calculatedValue = priceNum && quantityNum ? (priceNum * quantityNum).toFixed(2) : "0.00";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative border border-gray-100">
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-3xl p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Add New Product</h2>
              <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-blue-100 text-lg">Enter new product details</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                    setAddForm({ ...addForm, name: value.slice(0, 20) });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Select a category</option>
                {allowedCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={addForm.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 10) {
                      setAddForm({ ...addForm, price: value });
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={addForm.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 10) {
                      setAddForm({ ...addForm, quantity: value });
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 text-center border-2 border-blue-200">
              <p className="text-blue-700 font-medium text-sm">Estimated Total Value</p>
              <p className="text-4xl font-bold text-blue-800 mt-3">
                Rs. {calculatedValue}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSave}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
                <button
                  onClick={downloadFile}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
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
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Showing {filteredProducts.length} of {products.length} items</p>
              <button onClick={() => setSearchTerm("")} className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Search
              </button>
            </div>
          )}

          {error && <div className="text-red-600 text-center mb-4">{error}</div>}

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{product.name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate">{product.category || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Rs. {product.price ? Number(product.price).toFixed(2) : "0.00"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.quantity || 0} units</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Rs. {product.value ? Number(product.value).toFixed(2) : "0.00"}</td>
                        <td className="px-6 py-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDetailsModal(true);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-md"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>

                          <button
                            onClick={() => handleEditOpen(product)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-md"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>

                          <button
                            onClick={() => deleteItem(product._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-md"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-lg">
                        {searchTerm ? "No items found matching your search" : "No products available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modals */}
          <AddProductModal
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
          />

          <ProductEditModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
          />

          <ProductDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
          />
        </div>
      </div>
    </div>
  );
}

export default EndProducts;