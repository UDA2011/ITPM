import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function EditSupplier({ supplier, editSupplierModalSetting, handlePageUpdate }) {
  const [updatedSupplier, setUpdatedSupplier] = useState({
    name: supplier.name,
    contact: supplier.contact,
    email: supplier.email,
    address: supplier.address,
    unit: supplier.unit,
    deliveryTime: supplier.deliveryTime,
    cost: supplier.cost,
    historicalPerformance: supplier.historicalPerformance,
    distance: supplier.distance,
    supplierRating: supplier.supplierRating,
  });

  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Validation function
  const validate = () => {
    const newErrors = {};
    
    if (!updatedSupplier.name.trim()) newErrors.name = "Name is required";
    if (!updatedSupplier.contact.trim()) newErrors.contact = "Contact is required";
    if (!updatedSupplier.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedSupplier.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!updatedSupplier.address.trim()) newErrors.address = "Address is required";
    if (!updatedSupplier.unit.trim()) newErrors.unit = "Unit is required";
    if (updatedSupplier.deliveryTime < 0) newErrors.deliveryTime = "Delivery time cannot be negative";
    if (updatedSupplier.cost < 0) newErrors.cost = "Cost cannot be negative";
    if (updatedSupplier.historicalPerformance < 0 || updatedSupplier.historicalPerformance > 5) 
      newErrors.historicalPerformance = "Must be between 0 and 5";
    if (updatedSupplier.distance < 0) newErrors.distance = "Distance cannot be negative";
    if (updatedSupplier.supplierRating < 0 || updatedSupplier.supplierRating > 5) 
      newErrors.supplierRating = "Must be between 0 and 5";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    setUpdatedSupplier({ ...updatedSupplier, [key]: value });
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: null });
    }
  };

  // PUT Data to update a supplier
  const updateSupplier = () => {
    if (!validate()) return;

    fetch(`http://localhost:4000/api/suppliers/suppliers/${supplier._id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(updatedSupplier),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Supplier updated successfully!");
        handlePageUpdate(); // Refresh the supplier list
        editSupplierModalSetting(); // Close the modal
      })
      .catch((err) => {
        console.error("Error updating supplier:", err);
        alert("Failed to update supplier. Please try again.");
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
                      <PencilIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg py-4 font-semibold leading-6 text-gray-900"
                      >
                        Edit Supplier
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
                              value={updatedSupplier.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Supplier Name"
                              required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                              value={updatedSupplier.contact}
                              onChange={(e) =>
                                handleInputChange("contact", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Contact Number"
                              required
                            />
                            {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
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
                              value={updatedSupplier.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Email Address"
                              required
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                              value={updatedSupplier.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Address"
                              required
                            />
                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
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
                              value={updatedSupplier.unit}
                              onChange={(e) =>
                                handleInputChange("unit", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.unit ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Unit"
                              required
                            />
                            {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
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
                              value={updatedSupplier.deliveryTime}
                              onChange={(e) =>
                                handleInputChange("deliveryTime", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Delivery Time"
                              min="0"
                              required
                            />
                            {errors.deliveryTime && <p className="mt-1 text-sm text-red-600">{errors.deliveryTime}</p>}
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
                              value={updatedSupplier.cost}
                              onChange={(e) =>
                                handleInputChange("cost", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.cost ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Cost"
                              min="0"
                              required
                            />
                            {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
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
                              value={updatedSupplier.historicalPerformance}
                              onChange={(e) =>
                                handleInputChange("historicalPerformance", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.historicalPerformance ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Historical Performance"
                              min="0"
                              max="5"
                              step="0.1"
                              required
                            />
                            {errors.historicalPerformance && <p className="mt-1 text-sm text-red-600">{errors.historicalPerformance}</p>}
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
                              value={updatedSupplier.distance}
                              onChange={(e) =>
                                handleInputChange("distance", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.distance ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Distance"
                              min="0"
                              required
                            />
                            {errors.distance && <p className="mt-1 text-sm text-red-600">{errors.distance}</p>}
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
                              value={updatedSupplier.supplierRating}
                              onChange={(e) =>
                                handleInputChange("supplierRating", e.target.value)
                              }
                              className={`bg-gray-50 border ${errors.supplierRating ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                              placeholder="Supplier Rating"
                              min="0"
                              max="5"
                              step="0.1"
                              required
                            />
                            {errors.supplierRating && <p className="mt-1 text-sm text-red-600">{errors.supplierRating}</p>}
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
                    onClick={updateSupplier}
                  >
                    Update Supplier
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => editSupplierModalSetting()}
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