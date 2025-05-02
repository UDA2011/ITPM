import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SelectedSupplier() {
  const [searchCriteria, setSearchCriteria] = useState({
    material: "",
    quantity: "",
    priority: "balanced" // default to balanced approach
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleInputChange = (field, value) => {
    setSearchCriteria({
      ...searchCriteria,
      [field]: value
    });
  };

  const findBestSupplier = async () => {
    if (!searchCriteria.material || !searchCriteria.quantity) {
      setError("Material and quantity are required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:4000/api/suppliers/find-best", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material: searchCriteria.material,
          quantity: Number(searchCriteria.quantity),
          priority: searchCriteria.priority
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error("Error finding supplier:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setOpen(true);
  };

  const resetSearch = () => {
    setSearchCriteria({
      material: "",
      quantity: "",
      priority: "balanced"
    });
    setResults(null);
    setError(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Best Supplier</h1>
          
          {/* Search Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Material Input */}
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <input
                  type="text"
                  id="material"
                  value={searchCriteria.material}
                  onChange={(e) => handleInputChange("material", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. Steel, Plastic"
                />
              </div>

              {/* Quantity Input */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={searchCriteria.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. 500"
                  min="1"
                />
              </div>

              {/* Priority Select */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={searchCriteria.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="balanced">Balanced</option>
                  <option value="cost">Lowest Cost</option>
                  <option value="speed">Fastest Delivery</option>
                  <option value="quality">Highest Quality</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetSearch}
                className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Reset
              </button>
              <button
                type="button"
                onClick={findBestSupplier}
                disabled={isLoading}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Find Suppliers
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error searching for suppliers</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {results.message}
              </h2>

              {/* Database Suggestions */}
              {results.suggestions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Our Recommended Suppliers</h3>
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Supplier
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Cost
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Delivery Time
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Rating
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Available Qty
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Score
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {results.suggestions.map((supplier, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {supplier.supplierName}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              ${supplier.cost.toFixed(2)}/unit
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {supplier.deliveryTime} days
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`h-4 w-4 flex-shrink-0 ${star <= Math.round(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1">{supplier.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {supplier.availableQuantity} kg
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {supplier.score.toFixed(1)}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => openSupplierDetails(supplier)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Alibaba Suggestions */}
              {results.alibabaSuggestions.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">External Supplier Suggestions (Alibaba)</h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {results.alibabaSuggestions.map((supplier, index) => (
                      <div key={index} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                        <div className="p-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{supplier.supplier}</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Min Order:</span> {supplier.minOrder}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Price:</span> {supplier.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Rating:</span> {supplier.rating}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Delivery Time:</span> {supplier.deliveryTime}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 text-right">
                          <a
                            href={supplier.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            View on Alibaba
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Supplier Details Modal */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Supplier Details
                      </Dialog.Title>
                      <div className="mt-4">
                        {selectedSupplier && (
                          <div className="text-left space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Supplier Name</p>
                              <p className="text-sm text-gray-900">{selectedSupplier.supplierName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Contact</p>
                              <p className="text-sm text-gray-900">{selectedSupplier.contact}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="text-sm text-gray-900">{selectedSupplier.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Cost</p>
                              <p className="text-sm text-gray-900">${selectedSupplier.cost.toFixed(2)} per unit</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Delivery Time</p>
                              <p className="text-sm text-gray-900">{selectedSupplier.deliveryTime} days</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Available Quantity</p>
                              <p className="text-sm text-gray-900">{selectedSupplier.availableQuantity} kg</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Rating</p>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`h-5 w-5 flex-shrink-0 ${star <= Math.round(selectedSupplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-2 text-sm text-gray-900">{selectedSupplier.rating.toFixed(1)} out of 5</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Selection Score</p>
                              <p className="text-sm text-gray-900">{selectedSupplier.score.toFixed(1)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}