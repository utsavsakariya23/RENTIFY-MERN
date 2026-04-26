const express = require('express');
const router = express.Router();
const { getAllMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } = require('../controllers/MaintenanceController');
const { protect, admin } = require('../middlewares/auth');

router.use(protect, admin);
router.get('/', getAllMaintenance);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.delete('/:id', deleteMaintenance);

module.exports = router;
