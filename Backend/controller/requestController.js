const Request = require('../models/Request');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    // Handle both single request and batch requests
    const requests = Array.isArray(req.body) ? req.body : [req.body];
    
    // Validate and prepare requests
    const preparedRequests = requests.map(request => ({
      name: request.name?.trim(),
      currentQty: Number(request.currentQty),
      requestQty: Number(request.requestQty),
      status: 'out of_stock'
    }));

    // Validate all required fields
    const invalidRequests = preparedRequests.filter(req => 
      !req.name || isNaN(req.currentQty) || isNaN(req.requestQty)
    );

    if (invalidRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: invalidRequests
      });
    }

    const createdRequests = await Request.insertMany(preparedRequests);
    res.status(201).json({
      success: true,
      data: createdRequests
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.errors
    });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a request (e.g., change status)
exports.updateRequest = async (req, res) => {
  try {
    const { name, currentQty, requestQty, status } = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { name, currentQty, requestQty, status },
      { new: true } // Return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a request (custom status update)
exports.approveRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a request (custom status update)
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

