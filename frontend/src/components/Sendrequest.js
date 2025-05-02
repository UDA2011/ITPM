import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Sendrequest({ sendRequestModalSetting, handlePageUpdate }) {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/suppliers/suppliers");
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        alert("Failed to load suppliers. Please try again.");
      }
    };

    fetchSuppliers();
    setRequestDate(new Date().toISOString().split('T')[0]);
  }, []);

  const validate = () => {
    const newErrors = {};
    
    if (!selectedSupplier) newErrors.supplier = "Please select a supplier";
    if (!material.trim()) newErrors.material = "Please enter material name";
    if (!quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (!/^\d+$/.test(quantity)) {
      newErrors.quantity = "Quantity must be a whole number";
    } else if (parseInt(quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!requestDate) newErrors.requestDate = "Please select a request date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (key, value) => {
    if (errors[key]) {
      setErrors({ ...errors, [key]: null });
    }

    switch (key) {
      case "supplier":
        setSelectedSupplier(value);
        break;
      case "material":
        setMaterial(value);
        break;
      case "quantity":
        if (value === "" || /^\d+$/.test(value)) {
          setQuantity(value);
        }
        break;
      case "requestDate":
        setRequestDate(value);
        break;
      default:
        break;
    }
  };

  const sendRequest = async () => {
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      const selectedSupplierData = suppliers.find(s => s._id === selectedSupplier);
      if (!selectedSupplierData) {
        throw new Error("Selected supplier not found");
      }

      const requestData = {
        supplierId: selectedSupplier,
        supplierEmail: selectedSupplierData.email,
        supplierName: selectedSupplierData.name,
        material,
        quantity: parseInt(quantity),
        requestDate,
      };

      const response = await fetch("http://localhost:4000/api/suppliers/send-request", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send request");
      }

      alert(`Request sent successfully to ${selectedSupplierData.name}`);
      handlePageUpdate();
      sendRequestModalSetting();
    } catch (error) {
      console.error("Error sending request:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
                      <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg py-4 font-semibold leading-6 text-gray-900">
                        Send Supply Request
                      </Dialog.Title>
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          {/* Supplier Dropdown */}
                          <div className="sm:col-span-2">
                            <label htmlFor="supplier" className="block mb-2 text-sm font-medium text-gray-900">
                              Supplier *
                            </label>
                            <select
                              id="supplier"
                              className={`bg-gray-50 border ${errors.supplier ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5`}
                              name="supplier"
                              value={selectedSupplier}
                              onChange={(e) => handleInputChange("supplier", e.target.value)}
                              required
                            >
                              <option value="">Select Supplier</option>
                              {suppliers.map((supplier) => (
                                <option key={supplier._id} value={supplier._id}>
                                  {supplier.name} ({supplier.email})
                                </option>
                              ))}
                            </select>
                            {errors.supplier && <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>}
                          </div>

                          {/* Material Input */}
                          <div>
                            <label htmlFor="material" className="block mb-2 text-sm font-medium text-gray-900">
                              Material Name *
                            </label>
                            <input
                              type="text"
                              name="material"
                              id="material"
                              value={material}
                              onChange={(e) => handleInputChange("material", e.target.value)}
                              className={`bg-gray-50 border ${errors.material ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Enter material name"
                              required
                            />
                            {errors.material && <p className="mt-1 text-sm text-red-600">{errors.material}</p>}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">
                              Quantity (kg) *
                            </label>
                            <input
                              type="text"
                              name="quantity"
                              id="quantity"
                              value={quantity}
                              onChange={(e) => handleInputChange("quantity", e.target.value)}
                              className={`bg-gray-50 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              placeholder="Enter quantity in kg"
                              required
                            />
                            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                          </div>

                          {/* Request Date */}
                          <div className="sm:col-span-2">
                            <label htmlFor="requestDate" className="block mb-2 text-sm font-medium text-gray-900">
                              Request Date *
                            </label>
                            <input
                              type="date"
                              name="requestDate"
                              id="requestDate"
                              value={requestDate}
                              onChange={(e) => handleInputChange("requestDate", e.target.value)}
                              className={`bg-gray-50 border ${errors.requestDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                              required
                            />
                            {errors.requestDate && <p className="mt-1 text-sm text-red-600">{errors.requestDate}</p>}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                    onClick={sendRequest}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : "Send Request"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => sendRequestModalSetting()}
                    ref={cancelButtonRef}
                    disabled={isLoading}
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