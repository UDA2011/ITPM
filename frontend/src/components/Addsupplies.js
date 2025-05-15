import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AddSupplier({ addSupplierModalSetting, handlePageUpdate }) {
  const [supplier, setSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    unit: "kg",
    deliveryTime: 0,
    cost: 0,
    historicalPerformance: 0,
    distance: 0,
    supplierRating: 0,
    materials: []
  });

  const [materialInput, setMaterialInput] = useState({
    name: "",
    cost: 0,
    availableQuantity: 0,
    unit: "kg"
  });
  
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Add material to the list
  const addMaterial = () => {
    if (materialInput.name.trim()) {
      setSupplier({
        ...supplier,
        materials: [...supplier.materials, {
          name: materialInput.name.trim(),
          cost: Number(materialInput.cost),
          availableQuantity: Number(materialInput.availableQuantity),
          unit: materialInput.unit
        }]
      });
      setMaterialInput({
        name: "",
        cost: 0,
        availableQuantity: 0,
        unit: "kg"
      });
    }
  };

  // Remove material from the list
  const removeMaterial = (indexToRemove) => {
    setSupplier({
      ...supplier,
      materials: supplier.materials.filter((_, index) => index !== indexToRemove)
    });
  };

  // Handle material input change
  const handleMaterialInputChange = (key, value) => {
    setMaterialInput({
      ...materialInput,
      [key]: value
    });
  };

  // Validation function
  const validate = () => {
    const newErrors = {};
    
    if (!supplier.name.trim()) newErrors.name = "Name is required";
    if (!supplier.contact.trim()) newErrors.contact = "Contact is required";
    if (!supplier.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!supplier.address.trim()) newErrors.address = "Address is required";
    if (!supplier.unit.trim()) newErrors.unit = "Unit is required";
    if (supplier.deliveryTime < 0) newErrors.deliveryTime = "Delivery time cannot be negative";
    if (supplier.cost < 0) newErrors.cost = "Cost cannot be negative";
    if (supplier.historicalPerformance < 0 || supplier.historicalPerformance > 5) 
      newErrors.historicalPerformance = "Must be between 0 and 5";
    if (supplier.distance < 0) newErrors.distance = "Distance cannot be negative";
    if (supplier.supplierRating < 0 || supplier.supplierRating > 5) 
      newErrors.supplierRating = "Must be between 0 and 5";

    // Validate materials
    supplier.materials.forEach((material, index) => {
      if (!material.name.trim()) {
        newErrors[`materialName_${index}`] = "Material name is required";
      }
      if (material.cost < 0) {
        newErrors[`materialCost_${index}`] = "Material cost cannot be negative";
      }
      if (material.availableQuantity < 0) {
        newErrors[`materialQuantity_${index}`] = "Quantity cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handling Input Change for supplier fields
  const handleInputChange = (key, value) => {
    setSupplier({ ...supplier, [key]: value });
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: null });
    }
  };

  // POST Data to add a new supplier
 // In your addSupplier function, add more detailed error logging:
const addSupplier = () => {
  if (!validate()) return;

  console.log("Submitting supplier data:", supplier); // Log the data being sent

  fetch("http://localhost:4000/api/suppliers/suppliers", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(supplier),
  })
    .then((response) => {
      console.log("Response status:", response.status); // Log status code
      if (!response.ok) {
        return response.json().then(errData => {
          console.error("Server error details:", errData); // Log server error details
          throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errData)}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success response:", data); // Log success data
      alert("Supplier added successfully!");
      handlePageUpdate();
      addSupplierModalSetting();
    })
    .catch((err) => {
      console.error("Full error details:", err); // More detailed error logging
      alert(`Failed to add supplier: ${err.message}`);
    });
};

  return (
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
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
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
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Supplier Name"
                              required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                          </div>

                          {/* Contact */}
                          <div>
                            <label
                              htmlFor="contact"
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Contact Number"
                              required
                            />
                            {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
                          </div>

                          {/* Email */}
                          <div>
                            <label
                              htmlFor="email"
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Email Address"
                              required
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                          </div>

                          {/* Address */}
                          <div>
                            <label
                              htmlFor="address"
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Address"
                              required
                            />
                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                          </div>

                          {/* Unit */}
                          <div>
                            <label
                              htmlFor="unit"
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.unit ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Unit"
                              required
                            />
                            {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                          </div>

                          {/* Delivery Time */}
                          <div>
                            <label
                              htmlFor="deliveryTime"
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
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
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.cost ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
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
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.historicalPerformance ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
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
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.distance ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
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
                              className="block mb-2 text-sm font-medium text-gray-900"
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
                              className={`bg-gray-50 border ${errors.supplierRating ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Supplier Rating"
                              min="0"
                              max="5"
                              step="0.1"
                              required
                            />
                            {errors.supplierRating && <p className="mt-1 text-sm text-red-600">{errors.supplierRating}</p>}
                          </div>

                          {/* Materials Input */}
                          <div className="sm:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                              Materials
                            </label>
                            <div className="grid gap-4 mb-4 sm:grid-cols-3">
                              <div>
                                <label htmlFor="materialName" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                                <input
                                  type="text"
                                  id="materialName"
                                  value={materialInput.name}
                                  onChange={(e) => handleMaterialInputChange("name", e.target.value)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                  placeholder="Material name"
                                />
                              </div>
                              <div>
                                <label htmlFor="materialCost" className="block mb-2 text-sm font-medium text-gray-900">Cost</label>
                                <input
                                  type="number"
                                  id="materialCost"
                                  value={materialInput.cost}
                                  onChange={(e) => handleMaterialInputChange("cost", e.target.value)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                  placeholder="Cost"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label htmlFor="materialQuantity" className="block mb-2 text-sm font-medium text-gray-900">Quantity</label>
                                <input
                                  type="number"
                                  id="materialQuantity"
                                  value={materialInput.availableQuantity}
                                  onChange={(e) => handleMaterialInputChange("availableQuantity", e.target.value)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                  placeholder="Quantity"
                                  min="0"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end mb-4">
                              <button
                                type="button"
                                onClick={addMaterial}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                              >
                                Add Material
                              </button>
                            </div>
                            
                            {/* Display added materials */}
                            <div className="space-y-2">
                              {supplier.materials.map((material, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                  <div>
                                    <span className="font-medium">{material.name}</span>
                                    <span className="text-sm text-gray-600 ml-2">(Cost: {material.cost}, Qty: {material.availableQuantity} {material.unit})</span>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => removeMaterial(index)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
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