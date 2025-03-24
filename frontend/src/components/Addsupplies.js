import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddSupplier({ addSupplierModalSetting, handlePageUpdate }) {
  const [supplier, setSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    unit: "",
    deliveryTime: 0,
    cost: 0,
    historicalPerformance: 0,
    distance: 0,
    supplierRating: 0,
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    setSupplier({ ...supplier, [key]: value });
  };

  // POST Data to add a new supplier
  const addSupplier = () => {
    fetch("http://localhost:4000/api/suppliers/suppliers", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(supplier),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Supplier added successfully!");
        handlePageUpdate(); // Refresh the supplier list
        addSupplierModalSetting(); // Close the modal
      })
      .catch((err) => {
        console.error("Error adding supplier:", err);
        alert("Failed to add supplier. Please try again.");
      });
  };

  return (
    // Modal
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg py-4 font-semibold leading-6 text-gray-900"
                      >
                        Add Supplier
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          {/* Name */}
                          <div>
                            <label
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={supplier.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Supplier Name"
                              required
                            />
                          </div>

                          {/* Contact */}
                          <div>
                            <label
                              htmlFor="contact"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Contact
                            </label>
                            <input
                              type="text"
                              name="contact"
                              id="contact"
                              value={supplier.contact}
                              onChange={(e) =>
                                handleInputChange("contact", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Contact Number"
                              required
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <label
                              htmlFor="email"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={supplier.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Email Address"
                              required
                            />
                          </div>

                          {/* Address */}
                          <div>
                            <label
                              htmlFor="address"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Address
                            </label>
                            <input
                              type="text"
                              name="address"
                              id="address"
                              value={supplier.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Address"
                              required
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <label
                              htmlFor="unit"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Unit
                            </label>
                            <input
                              type="text"
                              name="unit"
                              id="unit"
                              value={supplier.unit}
                              onChange={(e) =>
                                handleInputChange("unit", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Unit"
                              required
                            />
                          </div>

                          {/* Delivery Time */}
                          <div>
                            <label
                              htmlFor="deliveryTime"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Delivery Time (Days)
                            </label>
                            <input
                              type="number"
                              name="deliveryTime"
                              id="deliveryTime"
                              value={supplier.deliveryTime}
                              onChange={(e) =>
                                handleInputChange("deliveryTime", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Delivery Time"
                              min="0"
                              required
                            />
                          </div>

                          {/* Cost */}
                          <div>
                            <label
                              htmlFor="cost"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Cost
                            </label>
                            <input
                              type="number"
                              name="cost"
                              id="cost"
                              value={supplier.cost}
                              onChange={(e) =>
                                handleInputChange("cost", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Cost"
                              min="0"
                              required
                            />
                          </div>

                          {/* Historical Performance */}
                          <div>
                            <label
                              htmlFor="historicalPerformance"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Historical Performance
                            </label>
                            <input
                              type="number"
                              name="historicalPerformance"
                              id="historicalPerformance"
                              value={supplier.historicalPerformance}
                              onChange={(e) =>
                                handleInputChange("historicalPerformance", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Historical Performance"
                              min="0"
                              max="5"
                              step="0.1"
                              required
                            />
                          </div>

                          {/* Distance */}
                          <div>
                            <label
                              htmlFor="distance"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Distance (km)
                            </label>
                            <input
                              type="number"
                              name="distance"
                              id="distance"
                              value={supplier.distance}
                              onChange={(e) =>
                                handleInputChange("distance", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Distance"
                              min="0"
                              required
                            />
                          </div>

                          {/* Supplier Rating */}
                          <div>
                            <label
                              htmlFor="supplierRating"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Supplier Rating
                            </label>
                            <input
                              type="number"
                              name="supplierRating"
                              id="supplierRating"
                              value={supplier.supplierRating}
                              onChange={(e) =>
                                handleInputChange("supplierRating", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Supplier Rating"
                              min="0"
                              max="5"
                              step="0.1"
                              required
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addSupplier}
                  >
                    Add Supplier
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addSupplierModalSetting()}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}