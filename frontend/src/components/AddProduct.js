import { Fragment, useRef, useState, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddProduct() {
  const authContext = useContext(AuthContext);

  const [form, setForm] = useState({
    productname: "",
    category: "",
    price: "",
    quantity: "",
    value: "",
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for price, quantity, and value
    if (name === "price" || name === "quantity" || name === "value") {
      if (value < 0) {
        alert(`${name} cannot be negative`);  // Fixed: using proper template literal
        return;
      }
    }

    setForm({ ...form, [name]: value });
  };

  const addProduct = async () => {
    try {
      console.log("Form Data:", form);

      // Check if all fields are filled
      if (!form.productname || !form.category || !form.price || !form.quantity || !form.value) {
        alert("Please fill out all fields");
        return;
      }

      // Check if price, quantity, and value are positive
      if (form.price <= 0 || form.quantity <= 0 || form.value <= 0) {
        alert("Price, Quantity, and Value must be positive numbers");
        return;
      }

      const response = await fetch("http://localhost:4000/api/addproduct/add", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add product");
      }

      alert("Product Added Successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.message || "Error adding product. Please try again.");
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl h-auto">
                <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900">
                        Add Raw Material
                      </Dialog.Title>
                      <form>
                        <div className="grid gap-6 mb-6 sm:grid-cols-2 mt-6">
                          <div>
                            <label htmlFor="productname" className="block mb-2 text-sm font-medium text-gray-900">
                              Raw Material Name
                            </label>
                            <input
                              type="text"
                              name="productname"
                              id="productname"
                              value={form.productname}
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
                              <option value="Other">Other</option>
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
                            />
                          </div>
                          <div>
                            <label htmlFor="value" className="block mb-2 text-sm font-medium text-gray-900">
                              Value
                            </label>
                            <input
                              type="number"
                              name="value"
                              id="value"
                              value={form.value}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                              placeholder="Enter Value"
                              required
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