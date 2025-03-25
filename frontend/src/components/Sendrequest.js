import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddSupplier({ addSupplierModalSetting, handlePageUpdate }) {
  const [suppliers, setSuppliers] = useState([]); // State to store supplier names
  const [products, setProducts] = useState([]); // State to store product names
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [email, setEmail] = useState("");

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Fetch suppliers and products from the database
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  // Fetch all suppliers
  const fetchSuppliers = () => {
    fetch("http://localhost:4000/api/suppliers/suppliers")
      .then((response) => response.json())
      .then((data) => {
        setSuppliers(data);
      })
      .catch((err) => console.error("Error fetching suppliers:", err));
  };

  // Fetch all products
  const fetchProducts = () => {
    fetch("http://localhost:4000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error("Error fetching products:", err));
  };

  // Handle input changes
  const handleInputChange = (key, value) => {
    switch (key) {
      case "supplier":
        setSelectedSupplier(value);
        break;
      case "product":
        setSelectedProduct(value);
        break;
      case "quantity":
        setQuantity(value);
        break;
      case "email":
        setEmail(value);
        break;
      default:
        break;
    }
  };

  // Send request to supplier
  const sendRequest = () => {
    const requestData = {
      supplierId: selectedSupplier,
      productId: selectedProduct,
      quantity: quantity,
      email: email,
    };

    fetch("http://localhost:4000/api/suppliers/send-request", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Request sent successfully!");
        handlePageUpdate(); // Refresh the page
        addSupplierModalSetting(); // Close the modal
      })
      .catch((err) => {
        console.error("Error sending request:", err);
        alert("Failed to send request. Please try again.");
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
                        Request Supplies
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          {/* Supplier Dropdown */}
                          <div>
                            <label
                              htmlFor="supplier"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Supplier
                            </label>
                            <select
                              id="supplier"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="supplier"
                              onChange={(e) =>
                                handleInputChange("supplier", e.target.value)
                              }
                              required
                            >
                              <option value="">Select Supplier</option>
                              {suppliers.map((supplier) => (
                                <option key={supplier._id} value={supplier._id}>
                                  {supplier.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Product Dropdown */}
                          <div>
                            <label
                              htmlFor="product"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Product
                            </label>
                            <select
                              id="product"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="product"
                              onChange={(e) =>
                                handleInputChange("product", e.target.value)
                              }
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div>
  <label
    htmlFor="quantity"
    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
  >
    Quantity
  </label>
  <input
    type="text" // Changed from "number" to "text"
    name="quantity"
    id="quantity"
    value={quantity}
    onChange={(e) =>
      handleInputChange("quantity", e.target.value)
    }
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
    placeholder="Quantity"
    required
  />
</div>

                          {/* Email */}
                          <div>
                            <label
                              htmlFor="email"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Supplier Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Supplier Email"
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
                    onClick={sendRequest}
                  >
                    Send Request
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