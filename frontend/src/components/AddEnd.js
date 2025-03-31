import { Fragment, useRef, useState, useContext, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddEnd({ isOpen, onClose, setUpdatePage, updatePage }) {
  const authContext = useContext(AuthContext);
  const [form, setForm] = useState({
    userID: authContext.user?._id || "",
    name: "",
    category: "",
    price: "",
    quantity: "",
    value: "",
    section: "end"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    price: "",
    quantity: ""
  });
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (form.price && form.quantity) {
      const calculatedValue = parseFloat(form.price) * parseInt(form.quantity);
      setForm(prev => ({
        ...prev,
        value: isNaN(calculatedValue) ? "" : calculatedValue.toFixed(2)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        value: ""
      }));
    }
  }, [form.price, form.quantity]);

  const handleNameChange = (e) => {
    const { value } = e.target;
    // Only allow letters and spaces, max length 20
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setForm(prev => ({
        ...prev,
        name: value
      }));
      // Check length validation
      if (value.length > 20) {
        setFieldErrors(prev => ({
          ...prev,
          name: "Product name must be 20 characters or less"
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          name: ""
        }));
      }
    }
    setError("");
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'quantity') {
      if (/^\d*\.?\d{0,2}$/.test(value) && value.length <= 7 && (value === '' || parseFloat(value) > 0)) {
        setForm(prev => ({
          ...prev,
          [name]: value
        }));
        setFieldErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [name]: "Must be a positive number with max 7 digits"
        }));
      }
    }
    setError("");
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setForm(prev => ({
      ...prev,
      category: value
    }));
    setError("");
  };

  const resetForm = () => {
    setForm({
      userID: authContext.user?._id || "",
      name: "",
      category: "",
      price: "",
      quantity: "",
      value: "",
      section: "end"
    });
    setFieldErrors({
      name: "",
      price: "",
      quantity: ""
    });
  };

  const validateForm = () => {
    const errors = {
      name: !form.name ? "Product name is required" : 
             form.name.length < 2 ? "Product name must be at least 2 characters" :
             form.name.length > 20 ? "Product name must be 20 characters or less" : "",
      price: !form.price ? "Price is required" : 
             parseFloat(form.price) <= 0 ? "Price must be positive" : 
             form.price.length > 7 ? "Price must not exceed 7 digits" : "",
      quantity: !form.quantity ? "Quantity is required" : 
                parseInt(form.quantity) <= 0 ? "Quantity must be positive" : 
                form.quantity.length > 7 ? "Quantity must not exceed 7 digits" : ""
    };

    setFieldErrors(errors);
    return Object.values(errors).every(error => error === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const productData = {
        ...form,
        userID: authContext.user._id,
        section: "end",
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        value: parseFloat(form.price) * parseInt(form.quantity)
      };

      const response = await fetch("http://localhost:4000/api/endproducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error(response.statusText || "Invalid server response");
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add product");
      }

      alert("Product added successfully!");
      resetForm();
      onClose();
      setUpdatePage(!updatePage);
    } catch (error) {
      console.error("Error adding product:", error);
      setError(error.message || "An error occurred while adding the product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-8 pt-8 pb-6 sm:p-10 sm:pb-8">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900">
                          Add End Product
                        </Dialog.Title>
                        {error && (
                          <div className="mt-2 text-sm text-red-600">
                            {error}
                          </div>
                        )}
                        <div className="grid gap-6 mb-6 sm:grid-cols-2 mt-6 w-full">
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                                Product Name *
                              </label>
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={form.name}
                                onChange={handleNameChange}
                                className={`bg-gray-50 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                                placeholder="Enter product name"
                                required
                                pattern="[a-zA-Z\s]+"
                                title="Only letters are allowed"
                                minLength="2"
                                maxLength="20"
                              />
                              {fieldErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                                Category *
                              </label>
                              <select
                                name="category"
                                id="category"
                                value={form.category}
                                onChange={handleCategoryChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                required
                              >
                                <option value="">Select a category</option>
                                <option value="Antibiotics">Antibiotics</option>
                                <option value="Antiparasitics">Antiparasitics</option>
                                <option value="Pain Relievers">Pain Relievers</option>
                                <option value="Vitamins">Vitamins</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">
                                Price *
                              </label>
                              <input
                                type="number"
                                name="price"
                                id="price"
                                value={form.price}
                                onChange={handleNumberInputChange}
                                className={`bg-gray-50 border ${fieldErrors.price ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                max="9999999"
                                required
                              />
                              {fieldErrors.price && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                value={form.quantity}
                                onChange={handleNumberInputChange}
                                className={`bg-gray-50 border ${fieldErrors.quantity ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                                placeholder="0"
                                min="1"
                                max="9999999"
                                required
                              />
                              {fieldErrors.quantity && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.quantity}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full">
                          <label htmlFor="value" className="block mb-2 text-sm font-medium text-gray-900">
                            Value (Auto-calculated)
                          </label>
                          <input
                            type="number"
                            name="value"
                            id="value"
                            value={form.value}
                            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
                            readOnly
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-8 py-6 sm:flex sm:flex-row-reverse sm:px-10">
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : "Add Product"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                      ref={cancelButtonRef}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}