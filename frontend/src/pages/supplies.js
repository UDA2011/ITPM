import React, { useState, useEffect, useContext } from "react";
import AddSupplier from "../components/Addsupplies";
import EditSupplier from "../components/EditSupplier";
import Sendrequest from "../components/Sendrequest";
import SelectedSupplier from "../components/selectedSupplier";
import AuthContext from "../AuthContext";

function Suppliers() {
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [showSelectedSupplierModal, setShowSelectedSupplierModal] = useState(false);
  const [suppliers, setAllSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSuppliersData();
  }, [updatePage]);

  const fetchSuppliersData = () => {
    fetch("http://localhost:4000/api/suppliers/suppliers")
      .then((response) => response.json())
      .then((data) => {
        setAllSuppliers(data);
      })
      .catch((err) => console.log(err));
  };

  const deleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      fetch(`http://localhost:4000/api/suppliers/suppliers/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to delete supplier");
          return response.json();
        })
        .then(() => {
          alert("Supplier deleted successfully!");
          handlePageUpdate();
        })
        .catch((err) => {
          console.error("Error deleting supplier:", err);
          alert("Failed to delete supplier. Please try again.");
        });
    }
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowEditSupplierModal(true);
  };

  const addSupplierModalSetting = () => {
    setShowSupplierModal(!showSupplierModal);
  };

  const sendRequestModalSetting = () => {
    setShowSendRequestModal(!showSendRequestModal);
  };

  const viewRequestModalSetting = () => {
    setShowViewRequestModal(!showViewRequestModal);
  };

  const selectedSupplierModalSetting = () => {
    setShowSelectedSupplierModal(!showSelectedSupplierModal);
  };

  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  const formatMaterials = (materials) => {
    if (!materials || materials.length === 0) return "N/A";
    
    return materials.map((material, index) => (
      <div key={index} className="mb-2 last:mb-0">
        <span className="font-semibold text-gray-800">{material.name}</span>
        <div className="text-sm text-gray-600">
          {material.availableQuantity} {material.unit} at ${material.cost.toFixed(2)}/{material.unit}
        </div>
      </div>
    ));
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-full max-w-screen-xl">
        {/* Modals */}
        {showSupplierModal && (
          <AddSupplier
            addSupplierModalSetting={addSupplierModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {showEditSupplierModal && (
          <EditSupplier
            supplier={selectedSupplier}
            editSupplierModalSetting={() => setShowEditSupplierModal(false)}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {showSendRequestModal && (
          <Sendrequest
            sendRequestModalSetting={sendRequestModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {showViewRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">View Requests</h2>
                <button
                  onClick={viewRequestModalSetting}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {/* Placeholder for request data */}
                <p className="text-gray-600">Request data will be displayed here.</p>
              </div>
            </div>
          </div>
        )}

        {showSelectedSupplierModal && (
          <SelectedSupplier
            selectedSupplierModalSetting={selectedSupplierModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Supplier Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex justify-between items-center pt-6 pb-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex gap-4 items-center">
              <span className="text-2xl font-bold text-gray-800">Suppliers</span>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                onClick={addSupplierModalSetting}
              >
                Add Supplier
              </button>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                onClick={sendRequestModalSetting}
              >
                Send Request
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                onClick={viewRequestModalSetting}
              >
                View Request
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                onClick={selectedSupplierModalSetting}
              >
                Select Supplier
              </button>
            </div>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { name: "Name", width: "w-1/6" },
                    { name: "Materials", width: "w-1/6" },
                    { name: "Contact", width: "w-1/6" },
                    { name: "Email", width: "w-2/6" },
                    { name: "Address", width: "w-2/6" },
                    { name: "Delivery (Days)", width: "w-1/6" },
                    { name: "Rating", width: "w-1/6" },
                    { name: "Actions", width: "w-1/6" },
                  ].map((header) => (
                    <th
                      key={header.name}
                      className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${header.width}`}
                    >
                      {header.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((supplier, index) => (
                  <tr
                    key={supplier._id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatMaterials(supplier.materials)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {supplier.contact}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {supplier.address}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {supplier.deliveryTime}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {supplier.supplierRating}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg mr-2 transition-all duration-200"
                        onClick={() => openEditModal(supplier)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-200"
                        onClick={() => deleteSupplier(supplier._id)}
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
    </div>
  );
}

export default Suppliers;