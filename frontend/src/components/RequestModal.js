import React, { useState } from "react";

const RequestModal = ({
  showRequestModal,
  setShowRequestModal,
  requestItems,
  quantities,
  setQuantities,
  onRequestSuccess
}) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, numValue) // Minimum request quantity is 1
    }));
  };

  const validateRequest = () => {
    // Check if there are items to request
    if (requestItems.length === 0) {
      setError("No items selected for request");
      return false;
    }

    // Check all selected items have valid request quantities
    const missingQuantities = requestItems.some(
      item => !quantities[item._id] || quantities[item._id] < 1
    );
    
    if (missingQuantities) {
      setError("Please enter valid quantities (minimum 1) for all items");
      return false;
    }

    // Check all items have required data (allow quantity to be 0)
    const invalidItems = requestItems.some(
      item => !item.name || item.quantity === undefined || item.quantity === null
    );
    
    if (invalidItems) {
      setError("Some items are missing required data");
      return false;
    }

    return true;
  };

  const sendRequest = async () => {
    if (!validateRequest()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const requests = requestItems.map(item => ({
        name: item.name,
        currentQty: item.quantity,
        requestQty: quantities[item._id],
        status: item.quantity <= 0 ? "out of stock" : "in stock" // Fixed status value
      }));

      const response = await fetch("http://localhost:4000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requests)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request");
      }

      // Success handling
      setShowRequestModal(false);
      setQuantities({});
      if (onRequestSuccess) onRequestSuccess(data.data);
      
    } catch (err) {
      setError(err.message || "An error occurred while submitting the request");
      console.error("Request error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showRequestModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Request Materials</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto mb-4">
          {requestItems.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No items selected for request
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Current Qty</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                  <th className="border px-4 py-2 text-left">Request Qty</th>
                </tr>
              </thead>
              <tbody>
                {requestItems.map(item => (
                  <tr key={item._id}>
                    <td className="border px-4 py-2">{item.name}</td>
                    <td className="border px-4 py-2">{item.quantity}</td>
                    <td className="border px-4 py-2 capitalize">
                      {item.status?.replace("_", " ") || (item.quantity <= 0 ? "out of stock" : "in stock")}
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={quantities[item._id] || ""}
                        onChange={e => handleQuantityChange(item._id, e.target.value)}
                        className="w-full p-1 border rounded"
                        onKeyDown={e => {
                          if (["-", "e", "E", "+"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowRequestModal(false);
              setQuantities({});
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={sendRequest}
            className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting || requestItems.length === 0}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">↻</span>
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;