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
  const [requests, setRequests] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatePage, setUpdatePage] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [error, setError] = useState(null);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSuppliersData();
    fetchRequestsData();
  }, [updatePage]);

  const fetchSuppliersData = async () => {
    setIsLoadingSuppliers(true);
    try {
      const response = await fetch("http://localhost:4000/api/suppliers/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setAllSuppliers(data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchRequestsData = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await fetch("http://localhost:4000/api/requests");
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const deleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/suppliers/suppliers/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete supplier");
        alert("Supplier deleted successfully!");
        handlePageUpdate();
      } catch (err) {
        console.error("Error deleting supplier:", err);
        alert("Failed to delete supplier. Please try again.");
      }
    }
  };

  const deleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/requests/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete request");
        alert("Request deleted successfully!");
        fetchRequestsData();
      } catch (err) {
        console.error("Error deleting request:", err);
        alert("Failed to delete request. Please try again.");
      }
    }
  };

  const openEditModal = (supplier) => {
    if (!supplier || !supplier._id) {
      console.error("Invalid supplier data:", supplier);
      alert("Cannot edit supplier: Invalid data.");
      return;
    }
    setSelectedSupplier(supplier);
    setShowEditSupplierModal(true);
  };

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setShowViewRequestModal(true);
  };

  const addSupplierModalSetting = () => setShowSupplierModal(!showSupplierModal);
  const editSupplierModalSetting = () => {
    setShowEditSupplierModal(false);
    setSelectedSupplier(null);
  };
  const sendRequestModalSetting = () => setShowSendRequestModal(!showSendRequestModal);
  const viewRequestModalSetting = () => {
    setShowViewRequestModal(!showViewRequestModal);
    setSelectedRequest(null);
  };
  const selectedSupplierModalSetting = () => setShowSelectedSupplierModal(!showSelectedSupplierModal);
  const handlePageUpdate = () => setUpdatePage(!updatePage);

  const formatMaterials = (materials) => {
    if (!materials || materials.length === 0) return <span className="text-gray-500">N/A</span>;
    return materials.map((material, index) => (
      <div key={index} className="mb-2">
        <span className="font-medium text-gray-800">{material.name}</span>
        <div className="text-sm text-gray-600">
          {material.availableQuantity} {material.unit} at ${material.cost.toFixed(2)}/{material.unit}
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Suppliers Dashboard</h1>
          <div className="flex space-x-3">
            <button
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              onClick={addSupplierModalSetting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Supplier
            </button>
            <button
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              onClick={sendRequestModalSetting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Request
            </button>
            <button
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              onClick={viewRequestModalSetting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Requests
            </button>
            <button
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              onClick={selectedSupplierModalSetting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Select Supplier
            </button>
          </div>
        </div>

        {/* Modals */}
        {showSupplierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <AddSupplier
                addSupplierModalSetting={addSupplierModalSetting}
                handlePageUpdate={handlePageUpdate}
              />
            </div>
          </div>
        )}

        {showEditSupplierModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <EditSupplier
                supplier={selectedSupplier}
                editSupplierModalSetting={editSupplierModalSetting}
                handlePageUpdate={handlePageUpdate}
              />
            </div>
          </div>
        )}

        {showSendRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <Sendrequest
                sendRequestModalSetting={sendRequestModalSetting}
                handlePageUpdate={handlePageUpdate}
              />
            </div>
          </div>
        )}

        {showViewRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRequest ? "Request Details" : "All Requests"}
                </h2>
                <button
                  onClick={viewRequestModalSetting}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                {selectedRequest ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-700">Product Name</h3>
                      <p className="text-gray-900">{selectedRequest.name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Current Quantity</h3>
                      <p className="text-gray-900">{selectedRequest.currentQty}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Requested Quantity</h3>
                      <p className="text-gray-900">{selectedRequest.requestQty}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Status</h3>
                      <p
                        className={`capitalize font-medium ${
                          selectedRequest.status === "approved"
                            ? "text-green-600"
                            : selectedRequest.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {selectedRequest.status}
                      </p>
                    </div>
                    <div className="col-span-2 flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          deleteRequest(selectedRequest._id);
                          setShowViewRequestModal(false);
                        }}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Delete Request
                      </button>
                      <button
                        onClick={viewRequestModalSetting}
                        className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {isLoadingRequests ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            {["Product", "Current Qty", "Requested Qty", "Status", "Actions"].map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {requests.map((request) => (
                            <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-gray-900">{request.name}</td>
                              <td className="px-6 py-4 text-gray-900">{request.currentQty}</td>
                              <td className="px-6 py-4 text-gray-900">{request.requestQty}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    request.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : request.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 flex flex-col space-y-2">
                                <button
                                  onClick={() => viewRequest(request)}
                                  className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
                                  aria-label="View request"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </button>
                                <button
                                  onClick={() => deleteRequest(request._id)}
                                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
                                  aria-label="Delete request"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showSelectedSupplierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <SelectedSupplier
                selectedSupplierModalSetting={selectedSupplierModalSetting}
                handlePageUpdate={handlePageUpdate}
              />
            </div>
          </div>
        )}

        {/* Supplier Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoadingSuppliers ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No suppliers found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Name",
                      "Materials",
                      "Contact",
                      "Email",
                      "Address",
                      "Delivery (Days)",
                      "Rating",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((supplier, index) => (
                    <tr
                      key={supplier._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-gray-900 font-medium">{supplier.name}</td>
                      <td className="px-6 py-4">{formatMaterials(supplier.materials)}</td>
                      <td className="px-6 py-4 text-gray-700">{supplier.contact}</td>
                      <td className="px-6 py-4 text-gray-700">{supplier.email}</td>
                      <td className="px-6 py-4 text-gray-700">{supplier.address}</td>
                      <td className="px-6 py-4 text-gray-700">{supplier.deliveryTime}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          {supplier.supplierRating}/5
                        </span>
                      </td>
                      <td className="px-6 py-4 flex flex-col space-y-2">
                        <button
                          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
                          onClick={() => openEditModal(supplier)}
                          aria-label="Edit supplier"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
                          onClick={() => deleteSupplier(supplier._id)}
                          aria-label="Delete supplier"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Suppliers;