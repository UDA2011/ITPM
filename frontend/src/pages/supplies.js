import React, { useState, useEffect, useContext } from "react";
import AddSupplier from "../components/Addsupplies";
import EditSupplier from "../components/EditSupplier"; // Import the EditSupplier component
import Sendrequest from "../components/Sendrequest";
import Suppliernotification from "../components/Suppliernotification";
import AuthContext from "../AuthContext";

function Suppliers() {
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false); // State for Edit modal
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [showSupplierNotificationModal, setShowSupplierNotificationModal] = useState(false);
  const [suppliers, setAllSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null); // State to store the selected supplier for editing
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSuppliersData();
  }, [updatePage]);

  // Fetching Data of All Suppliers
  const fetchSuppliersData = () => {
    fetch("http://localhost:4000/api/suppliers/suppliers")
      .then((response) => response.json())
      .then((data) => {
        setAllSuppliers(data);
      })
      .catch((err) => console.log(err));
  };

  // Delete a Supplier
  const deleteSupplier = (id) => {
    fetch(`http://localhost:4000/api/suppliers/suppliers/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Supplier deleted successfully!");
        handlePageUpdate(); // Refresh the supplier list
      })
      .catch((err) => {
        console.error("Error deleting supplier:", err);
        alert("Failed to delete supplier. Please try again.");
      });
  };

  // Open Edit Modal and Set Selected Supplier
  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier); // Set the selected supplier
    setShowEditSupplierModal(true); // Open the edit modal
  };

  // Modal for Supplier Add
  const addSupplierModalSetting = () => {
    setShowSupplierModal(!showSupplierModal);
  };

  // Modal for Send Request
  const sendRequestModalSetting = () => {
    setShowSendRequestModal(!showSendRequestModal);
  };

  // Modal for Supplier Notification
  const supplierNotificationModalSetting = () => {
    setShowSupplierNotificationModal(!showSupplierNotificationModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {/* Add Supplier Modal */}
        {showSupplierModal && (
          <AddSupplier
            addSupplierModalSetting={addSupplierModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Edit Supplier Modal */}
        {showEditSupplierModal && (
          <EditSupplier
            supplier={selectedSupplier} // Pass the selected supplier to the modal
            editSupplierModalSetting={() => setShowEditSupplierModal(false)}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Send Request Modal */}
        {showSendRequestModal && (
          <Sendrequest
            sendRequestModalSetting={sendRequestModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Supplier Notification Modal */}
        {showSupplierNotificationModal && (
          <Suppliernotification
            supplierNotificationModalSetting={supplierNotificationModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Table  */}
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
                onClick={supplierNotificationModalSetting}
              >
                Supplier Notification
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
                  Contact
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Email
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Address
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Unit
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Delivery Time (Days)
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Cost
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Historical Performance
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Distance (km)
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Supplier Rating
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {suppliers.map((element, index) => {
                return (
                  <tr key={element._id}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {element.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.contact}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.address}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.deliveryTime}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.cost}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.historicalPerformance}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.distance}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.supplierRating}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 text-xs rounded mr-2"
                        onClick={() => openEditModal(element)} // Open edit modal with selected supplier
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold p-1 text-xs rounded"
                        onClick={() => deleteSupplier(element._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Suppliers;