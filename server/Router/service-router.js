const express = require('express');


const router = express.Router();

const {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require('../Controller/service-controller');  // Use require, not a string path


console.log( getAllServices, getServiceById, createService, updateService, deleteService);
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
