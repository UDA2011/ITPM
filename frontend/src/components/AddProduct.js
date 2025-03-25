import { Fragment, useRef, useState, useContext, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddProduct() {
  const authContext = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    value: "",
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for raw material name (only letters allowed)
    if (name === "name") {
      const letterPattern = /^[A-Za-z\s]+$/;
      if (!letterPattern.test(value) && value !== "") {
        setError("Raw Material Name can only contain letters and spaces.");
      } else {
        setError("");
      }
    }

    // Validation for price, quantity
    if (name === "price" || name === "quantity") {
      if (value < 0) {
        setError(`${name} cannot be negative`);
        return;
      }
      if (value.length > 6) {
        setError(`${name} cannot exceed 6 digits`);
        return;
      }
    }

    setForm({ ...form, [name]: value });
  };

  // Auto-calculate value whenever price or quantity changes
  useEffect(() => {
    if (form.price && form.quantity) {
      const calculatedValue = (parseFloat(form.price) * parseFloat(form.quantity)).toFixed(2);
      setForm(prevForm => ({
        ...prevForm,
        value: calculatedValue
      }));
    }
  }, [form.price, form.quantity]);

  const addProduct = async () => {
    try {
      // Reset error
      setError("");

      // Check if all fields are filled
      const requiredFields = ['name', 'category', 'price', 'quantity'];
      const emptyFields = requiredFields.filter(field => !form[field]);
      
      if (emptyFields.length > 0) {
        setError(`Please fill out: ${emptyFields.join(', ')}`);
        return;
      }

      // Check if price and quantity are positive numbers
      if (parseFloat(form.price) <= 0 || parseFloat(form.quantity) <= 0) {
        setError("Price and Quantity must be positive numbers");
        return;
      }

      const productData = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        value: parseFloat(form.value) || 0
      };

      const response = await fetch("http://localhost:4000/api/inventory", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add product");
      }

      alert("Product Added Successfully");
      setOpen(false);
      // Reset form after successful submission
      setForm({
        name: "",
        category: "",
        price: "",
        quantity: "",
        value: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      setError(error.message || "Error adding product. Please try again.");
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:h-auto">
                <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900">
                        Add Raw Material
                      </Dialog.Title>
                      {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                          {error}
                        </div>
                      )}
                      <form>
                        <div className="grid gap-6 mb-6 sm:grid-cols-2 mt-6">
                          <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                              Raw Material Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={form.name}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                              placeholder="Enter Raw Material Name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                              Category
                            </label>
                            <select
                              id="category"
                              name="category"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                              value={form.category}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select a category</option>
                              <option value="Excipients">Excipients</option>
                              <option value="Active Pharmaceutical Ingredients">
                                Active Pharmaceutical Ingredients
                              </option>
                              <option value="Solvents & Diluents">Solvents & Diluents</option>
                              <option value="Additives & Enhancers">Additives & Enhancers</option>                            
                            </select>
                          </div>
                          <div>
                            <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">
                              Price
                            </label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              value={form.price}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                              placeholder="Enter Price"
                              required
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">
                              Quantity
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              value={form.quantity}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                              placeholder="Enter Quantity"
                              required
                              min="1"
                            />
                          </div>
                          <div>
                            <label htmlFor="value" className="block mb-2 text-sm font-medium text-gray-900">
                              Value (Auto-calculated)
                            </label>
                            <input
                              type="text"
                              name="value"
                              id="value"
                              value={form.value}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
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
                    className="inline-flex justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addProduct}
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
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