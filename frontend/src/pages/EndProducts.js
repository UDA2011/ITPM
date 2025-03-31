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
  const [updatePage, setUpdatePage] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchProductsData();
  }, [updatePage]);

  useEffect(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/endproducts`)
      .then(response => response.json())
      .then(data => {
        setAllProducts(data);
        setFilteredProducts(data);
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    
    try {
      await fetch(`http://localhost:4000/api/endproducts/${id}`, { method: "DELETE" });
      setUpdatePage(prev => !prev);
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

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("End Products Inventory Report", 105, 10, { align: "left" });

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 20);

    const headers = [
      "S/N", "Product Name", "Category", "Price (Rs.)", "Quantity", "Value (Rs.)"
    ];
    
    const data = filteredProducts.map((product, index) => [
      index + 1,
      product.name || "N/A",
      product.category || "N/A",
      product.price ? Number(product.price).toFixed(2) : "0.00",
      product.quantity || 0,
      product.value ? Number(product.value).toFixed(2) : "0.00"
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 25,
      styles: { fontSize: 9, cellPadding: 3, valign: "middle", halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 25 }
    });

    doc.save(`End_Products_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col gap-4 mb-4">
            <h2 className="font-bold text-lg">End Product Items</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search by name or category"
                  className="w-full p-2 border rounded-lg pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  onClick={() => setShowProductModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                  onClick={downloadFile}
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
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2 w-[12.5%]">S/N</th>
                  <th className="border px-4 py-2 w-[12.5%]">Name</th>
                  <th className="border px-4 py-2 w-[12.5%]">Category</th>
                  <th className="border px-4 py-2 w-[12.5%]">Price</th>
                  <th className="border px-4 py-2 w-[12.5%]">Quantity</th>
                  <th className="border px-4 py-2 w-[12.5%]">Value</th>
                  <th className="border px-4 py-2 w-[12.5%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td className="border px-4 py-2 w-[12.5%] text-center">{index + 1}</td>
                      <td className="border px-4 py-2 w-[12.5%]">{product.name}</td>
                      <td className="border px-4 py-2 w-[12.5%]">{product.category}</td>
                      <td className="border px-4 py-2 w-[12.5%] text-center">Rs. {product.price}</td>
                      <td className="border px-4 py-2 w-[12.5%] text-center">{product.quantity} units</td>
                      <td className="border px-4 py-2 w-[12.5%] text-center">Rs. {product.value}</td>
                      <td className="border px-4 py-2 w-[12.5%] text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1"
                            onClick={() => { setUpdateProduct(product); setShowUpdateModal(true); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                            onClick={() => deleteItem(product._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <td colSpan="7" className="border px-4 py-6 text-center text-gray-500">
                      {searchTerm 
                        ? "No items found matching your search" 
                        : "No products available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddEnd 
          isOpen={showProductModal} 
          onClose={() => setShowProductModal(false)} 
          setUpdatePage={setUpdatePage} 
        />
        <EditEnd 
          isOpen={showUpdateModal} 
          onClose={() => setShowUpdateModal(false)} 
          product={updateProduct} 
          onUpdate={() => setUpdatePage(!updatePage)} 
        />
      </div>
    </div>
  );
}

export default EndProducts;