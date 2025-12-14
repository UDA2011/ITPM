import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AddProduct from "../components/AddProduct";
import RequestModal from "../components/RequestModal";
import AuthContext from "../AuthContext";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedSection, setSelectedSection] = useState("raw");
  const [requestItems, setRequestItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Allowed categories exactly as per your screenshot
  const allowedCategories = [
    "Excipients",
    "Active Pharmaceutical Ingredients",
    "Solvents & Diluents",
    "Additives & Enhancers",
  ];

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
        headers: { "Content-Type": "application/json" },
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
      const response = await fetch(`http://localhost:4000/api/inventory/${updateProduct._id}`, {
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
      setUpdatePage((prev) => !prev);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update product. Please try again.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:4000/api/inventory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");
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
    const title = `${selectedSection === "raw" ? "Raw Material" : "End Product"} Inventory Report`;
    doc.text(title, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Items: ${filteredProducts.length}`, 14, 34);

    const inStock = filteredProducts.filter((p) => p.status === "in_stock").length;
    const lowStock = filteredProducts.filter((p) => p.status === "low_stock").length;
    const outOfStock = filteredProducts.filter((p) => p.status === "out_of_stock").length;
    const totalValue = filteredProducts.reduce((sum, p) => sum + parseFloat(p.value || 0), 0).toFixed(2);

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
      styles: { fontSize: 9, cellPadding: 2, textColor: [50, 50, 50] },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 30 } },
    });

    const headers = ["S/N", "Name", "Category", "Price (Rs.)", "Quantity", "Value (Rs.)", "Status"];
    const data = filteredProducts.map((product, index) => [
      index + 1,
      product.name,
      product.category,
      parseFloat(product.price).toFixed(2),
      `${product.quantity} ${selectedSection === "raw" ? "kg" : "units"}`,
      parseFloat(product.value).toFixed(2),
      product.status === "out_of_stock" ? "Out of Stock" : product.status === "low_stock" ? "Low Stock" : "In Stock",
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

    doc.save(`${selectedSection === "raw" ? "Raw_Materials" : "End_Products"}_Inventory_Report.pdf`);
  };

  const prepareRequest = () => {
    const itemsToRequest = products.filter((p) => p.status === "low_stock" || p.status === "out_of_stock");
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

  // Beautiful Product Details Modal
  const ProductDetailsModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const unitLabel = selectedSection === "raw" ? "kg" : "units";
    const statusColor = product.status === "out_of_stock" ? "bg-red-100 text-red-800" :
                        product.status === "low_stock" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800";

    const formatDate = (dateString) => {
      if (!dateString) return "Unknown date";
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
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
                  <p className="text-green-700 font-medium text-lg -mt-1">{unitLabel}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
                <p className="text-purple-600 font-medium text-sm">Total Value</p>
                <p className="text-4xl font-bold text-purple-800 mt-3">
                  Rs. {product.value ? Number(product.value).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <span className={`px-6 py-3 rounded-full text-sm font-bold ${statusColor}`}>
                {product.status === "out_of_stock" ? "Out of Stock" :
                 product.status === "low_stock" ? "Low Stock" : "In Stock"}
              </span>
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
                              Quantity: <span className="text-indigo-600">{entry.quantity} {unitLabel}</span>
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

  // Beautiful Edit Modal (with dropdown)
  const ProductEditModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const priceNum = parseFloat(editForm.price) || 0;
    const quantityNum = parseInt(editForm.quantity, 10) || 0;
    const calculatedValue = (priceNum * quantityNum).toFixed(2);
    const unitLabel = selectedSection === "raw" ? "kg" : "units";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative border border-gray-100">
          <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-3xl p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Edit {selectedSection === "raw" ? "Material" : "Product"}</h2>
              <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-amber-100 text-lg">Update details</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="">Select a category</option>
                {allowedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity ({unitLabel})</label>
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

  // Add Material Modal - Final Fix with currentQty
  const AddMaterialModal = ({ isOpen, onClose }) => {
    const [addForm, setAddForm] = useState({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });

    if (!isOpen) return null;

    const priceNum = parseFloat(addForm.price) || 0;
    const quantityNum = parseInt(addForm.quantity, 10) || 0;
    const calculatedValue = priceNum && quantityNum ? (priceNum * quantityNum).toFixed(2) : "0.00";

    const handleAddSave = async () => {
      // Name validation
      if (!addForm.name.trim()) {
        alert("Name is required.");
        return;
      }
      if (!/^[A-Za-z\s&]+$/.test(addForm.name.trim())) {
        alert("Name can only contain letters, spaces, and &.");
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
      if (priceNum <= 0) {
        alert("Please enter a valid price greater than 0.");
        return;
      }
      if (addForm.price.length > 10) {
        alert("Price cannot exceed 10 digits.");
        return;
      }

      // Quantity validation
      if (quantityNum <= 0) {
        alert("Please enter a valid quantity greater than 0.");
        return;
      }
      if (addForm.quantity.length > 10) {
        alert("Quantity cannot exceed 10 digits.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: addForm.name.trim(),
            category: addForm.category,
            price: priceNum,
            currentQty: quantityNum,  // ← Critical fix: backend expects currentQty
            value: parseFloat(calculatedValue),
            type: selectedSection,
            status: "in_stock",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to add item");
        }

        onClose();
        setUpdatePage((prev) => !prev);
      } catch (err) {
        console.error("Add error:", err);
        alert(err.message || "Failed to add item. Please try again.");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative border border-gray-100">
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-3xl p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Add New {selectedSection === "raw" ? "Material" : "Product"}</h2>
              <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-blue-100 text-lg">Enter new item details</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[A-Za-z\s&]*$/.test(value)) {
                    setAddForm({ ...addForm, name: value.slice(0, 20) });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Select a category</option>
                {allowedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity ({selectedSection === "raw" ? "kg" : "units"}, </label>
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
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Beautiful Send Request Modal
  const SendRequestModal = ({ isOpen, onClose }) => {
    if (!isOpen || requestItems.length === 0) return null;

    const handleQuantityChange = (id, value) => {
      if (value === "" || /^\d+$/.test(value)) {
        setQuantities({ ...quantities, [id]: value });
      }
    };

    const handleSendRequest = () => {
      alert("Request sent successfully!");
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-100">
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Send Stock Request</h2>
              <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-green-100 text-lg">Request restock for low/out of stock items</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {requestItems.map((item) => (
                <div key={item._id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Current: {item.quantity} {selectedSection === "raw" ? "kg" : "units"} • Status: {" "}
                      <span className={item.status === "out_of_stock" ? "text-red-600" : "text-yellow-600"}>
                        {item.status === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Request Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={quantities[item._id] || ""}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Qty"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Send Request
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
        {selectedSection === "raw" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Raw Material Status</h2>
              <button
                onClick={prepareRequest}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

        <div className="bg-white rounded-2xl border p-6 shadow-lg">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {selectedSection === "raw" ? "Raw Material Items" : "End Product Items"}
            </h2>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder={`Search ${selectedSection === "raw" ? "by name or category" : "products"}`}
                  className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addProductModalSetting}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add {selectedSection === "raw" ? "Material" : "Product"}
                </button>
                <button
                  onClick={downloadPDF}
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
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
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
                            product.status === "out_of_stock" ? "bg-red-100 text-red-800" :
                            product.status === "low_stock" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
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
                            onClick={() => deleteProduct(product._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-md"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-lg">
                      {searchTerm ? "No items found matching your search" : "No inventory items available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AddMaterialModal
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

          <SendRequestModal
            isOpen={showRequestModal}
            onClose={() => setShowRequestModal(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default Inventory;