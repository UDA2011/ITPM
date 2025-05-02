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

  const selectedSupplierModalSetting = () => {
    setShowSelectedSupplierModal(!showSelectedSupplierModal);
  };

  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  const formatMaterials = (materials) => {
    if (!materials || materials.length === 0) return "N/A";
    
    return materials.map((material, index) => (
      <div key={index} className="mb-1 last:mb-0">
        <span className="font-medium">{material.name}</span>
        <div className="text-xs text-gray-500">
          {material.availableQuantity} {material.unit} at ${material.cost.toFixed(2)}/{material.unit}
        </div>
      </div>
    ));
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
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

        {showSelectedSupplierModal && (
          <SelectedSupplier
            selectedSupplierModalSetting={selectedSupplierModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Supplier Table */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center">
              <span className="font-bold">Suppliers</span>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={addSupplierModalSetting}
              >
                Add Supplier
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={sendRequestModalSetting}
              >
                Send Request
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={selectedSupplierModalSetting}
              >
                Select Supplier
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Materials
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Contact
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Email
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Address
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Delivery (Days)
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Rating
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {formatMaterials(supplier.materials)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {supplier.contact}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {supplier.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {supplier.address}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {supplier.deliveryTime}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {supplier.supplierRating}/5
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 text-xs rounded mr-2"
                      onClick={() => openEditModal(supplier)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold p-1 text-xs rounded"
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
  );
}

export default Suppliers;