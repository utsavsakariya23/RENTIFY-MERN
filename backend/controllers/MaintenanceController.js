const { Maintenance, Car } = require('../models');

const getAllMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.findAll({
      include: [{ model: Car, as: 'car', attributes: ['car_id', 'name', 'brand', 'car_type'] }],
      order: [['scheduled_date', 'DESC']]
    });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.create(req.body);
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
    await record.update(req.body);
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    await record.destroy();
    res.json({ message: 'Maintenance record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllMaintenance, createMaintenance, updateMaintenance, deleteMaintenance };
