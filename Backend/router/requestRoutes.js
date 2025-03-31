const express = require('express');
const router = express.Router();
const requestController = require('../controller/requestController'); // Correct path

// CRUD Routes
router.post('/', requestController.createRequest);
router.get('/', requestController.getAllRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

// Status Update Routes
router.patch('/:id/approve', requestController.approveRequest);
router.patch('/:id/reject', requestController.rejectRequest);

module.exports = router;

