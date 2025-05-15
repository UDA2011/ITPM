import { Fragment, useRef, useState, useContext, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddProduct({ setUpdatePage, addProductModalSetting, productType }) {
  const authContext = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    category: "Excipients",
    price: "",
    quantity: "",
    value: ""
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const letterPattern = /^[A-Za-z\s]*$/;
      if (value.length > 20) {
        setError("Raw Material Name cannot exceed 20 characters.");
        return;
      }
      if (!letterPattern.test(value)) {
        setError("Raw Material Name can only contain letters and spaces.");
        return;
      }
      setError("");
    }

    if (name === "price" || name === "quantity") {
      if (value === "") {
        setForm({ ...form, [name]: value });
        setError("");
        return;
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setError(`${name} must be a valid non-negative number`);
        return;
      }
      if (value.length > 6) {
        setError(`${name} cannot exceed 6 digits`);
        return;
      }
    }

    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (form.price && form.quantity && !isNaN(parseFloat(form.price)) && !isNaN(parseInt(form.quantity))) {
      const calculatedValue = (parseFloat(form.price) * parseInt(form.quantity)).toFixed(2);
      setForm((prevForm) => ({
        ...prevForm,
        value: calculatedValue
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        value: ""
      }));
    }
  }, [form.price, form.quantity]);

  const handleClose = () => {
    setOpen(false);
    addProductModalSetting();
  };

  const addProduct = async () => {
    try {
      setError("");
      const requiredFields = ["name", "category", "price", "quantity"];
      const emptyFields = requiredFields.filter((field) => !form[field] || form[field] === "");
      if (emptyFields.length > 0) {
        setError(`Please fill out: ${emptyFields.join(", ")}`);
        return;
      }
      if (form.name.length > 20) {
        setError("Raw Material Name cannot exceed 20 characters");
        return;
      }
      const price = parseFloat(form.price);
      const quantity = parseInt(form.quantity);
      if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
        setError("Price and Quantity must be valid positive numbers");
        return;
      }
      if (!["Excipients", "Active Pharmaceutical Ingredients", "Solvents & Diluents", "Additives & Enhancers"].includes(form.category)) {
        setError("Invalid category selected");
        return;
      }
      const productData = {
        name: form.name,
        category: form.category,
        price: price,
        quantity: quantity,
        currentQty: quantity,
        requestQty: 0
      };
      console.log("Sending productData:", JSON.stringify(productData, null, 2));
      const response = await fetch("http://localhost:4000/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Backend error:", result);
        throw new Error(result.message || `HTTP ${response.status}: Failed to add product`);
      }
      alert("Product Added Successfully");
      handleClose();
      setForm({
        name: "",
        category: "Excipients",
        price: "",
        quantity: "",
        value: ""
      });
      setUpdatePage((prev) => !prev);
    } catch (error) {
      console.error("Error adding product:", error);
      setError(error.message || "Failed to add product. Please try again.");
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-80 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-lg ring-1 ring-gray-200 transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:h-auto">
                <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-110">
                      <PlusIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                        Add {productType === "raw" ? "Raw Material" : "End Product"}
                      </Dialog.Title>
                      {error && (
                        <Transition
                          show={!!error}
                          enter="transition-opacity duration-200"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="transition-opacity duration-150"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                            <span>{error}</span>
                          </div>
                        </Transition>
                      )}
                      <form>
                        <div className="grid gap-6 mb-6 sm:grid-cols-2 mt-6">
                          <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
                              {productType === "raw" ? "Raw Material Name" : "Product Name"}
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={form.name}
                              onChange={handleInputChange}
                              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[16rem] p-3 transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                              placeholder={`Enter ${productType === "raw" ? "Raw Material" : "Product"} Name`}
                              required
                              maxLength={20}
                            />
                          </div>
                          <div>
                            <label htmlFor="category" className="block mb-2 text-sm font-semibold text-gray-700">
                              Category
                            </label>
                            <select
                              id="category"
                              name="category"
                              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[16rem] p-3 transition-all duration-200 hover:border-gray-300"
                              value={form.category}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="Excipients">Select a category</option>
                              <option value="Excipients">Excipients</option>
                              <option value="Active Pharmaceutical Ingredients">
                                Active Pharmaceutical Ingredients
                              </option>
                              <option value="Solvents & Diluents">Solvents & Diluents</option>
                              <option value="Additives & Enhancers">Additives & Enhancers</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="price" className="block mb-2 text-sm font-semibold text-gray-700">
                              Price
                            </label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              value={form.price}
                              onChange={handleInputChange}
                              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[16rem] p-3 transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                              placeholder="Enter Price (e.g., 10.50)"
                              required
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label htmlFor="quantity" className="block mb-2 text-sm font-semibold text-gray-700">
                              Quantity
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              value={form.quantity}
                              onChange={handleInputChange}
                              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[16rem] p-3 transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                              placeholder="Enter Quantity (e.g., 100)"
                              required
                              min="1"
                            />
                          </div>
                          <div>
                            <label htmlFor="value" className="block mb-2 text-sm font-semibold text-gray-700">
                              Value (Auto-calculated)
                            </label>
                            <input
                              type="text"
                              name="value"
                              id="value"
                              value={form.value}
                              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg block w-full min-w-[16rem] p-3 transition-all duration-200 placeholder-gray-400"
                              placeholder="Calculated Value"
                              readOnly
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-blue-600 sm:ml-3 sm:w-auto transition-all duration-200"
                    onClick={addProduct}
                  >
                    Add {productType === "raw" ? "Material" : "Product"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100 hover:text-gray-900 sm:mt-0 sm:w-auto transition-all duration-200"
                    onClick={handleClose}
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