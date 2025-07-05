import express from 'express';
import { PropertyController } from '../controllers/PropertyController.js';

const router = express.Router();

// Property Management Routes
router.get('/', PropertyController.getAllProperties);
router.get('/:id', PropertyController.getPropertyById);
router.post('/', PropertyController.createProperty);
router.put('/:id', PropertyController.updateProperty);
router.patch('/:id/status', PropertyController.updatePropertyStatus);
router.delete('/:id', PropertyController.deleteProperty);
router.post('/:id/images', PropertyController.uploadPropertyImages);
router.delete('/:id/images/:imageId', PropertyController.deletePropertyImage);
router.get('/amenities/all', PropertyController.getAllAmenities);

export default router;