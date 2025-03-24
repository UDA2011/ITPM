import React, { useState, useEffect, useContext } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AddEnd from "../components/AddEnd"; // Import AddEnd instead of AddProduct
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";

function EndProducts() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatePage, setUpdatePage] = useState(true);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchProductsData();
  }, [updatePage]);

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}?section=end`)
      .then((response) => response.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.log(err));
  };

  const deleteItem = (id) => {
    fetch(`http://localhost:4000/api/product/delete/${id}`)
      .then((response) => response.json())
      .then(() => setUpdatePage(!updatePage));
  };

  const downloadFile = () => {
    const doc = new jsPDF();
    doc.text("End Products Inventory Report", 14, 10);
    const tableColumn = ["Item Number", "Name", "Category", "Price", "Quantity", "Value"];
    const tableRows = [];

    products.forEach((product) => {
      const rowData = [
        product._id,
        product.name,
        product.manufacturer,
        product.price,
        product.stock,
        product.value,
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("end_products_inventory.pdf");
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center">
              <span className="font-bold">End Product Items</span>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
              onClick={() => setShowProductModal(true)}
            >
              Add Product
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold p-2 text-xs rounded"
              onClick={downloadFile}
            >
              Download PDF
            </button>
          </div>

          {/* Render AddEnd modal instead of AddProduct */}
          {showProductModal && <AddEnd closeModal={() => setShowProductModal(false)} />}

          {showUpdateModal && <UpdateProduct product={updateProduct} closeModal={() => setShowUpdateModal(false)} />}

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Item Number</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-2">{product._id}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.manufacturer}</td>
                  <td className="px-4 py-2">{product.price}</td>
                  <td className="px-4 py-2">{product.stock}</td>
                  <td className="px-4 py-2">{product.value}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 text-xs rounded"
                      onClick={() => { setUpdateProduct(product); setShowUpdateModal(true); }}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded"
                      onClick={() => alert(`Viewing details for ${product.name}`)}
                    >
                      View
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 text-xs rounded"
                      onClick={() => deleteItem(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EndProducts;