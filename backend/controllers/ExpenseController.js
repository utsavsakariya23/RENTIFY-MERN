const { Expense, Booking } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('../utils/cloudinary');

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ order: [['expense_date', 'DESC']] });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await expense.update(req.body);
    res.json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await expense.destroy();
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getBusinessSummary = async (req, res) => {
  try {
    const paidBookings = await Booking.findAll({ where: { payment_status: 'Paid' } });
    const totalRevenue = paidBookings.reduce((s, b) => s + parseFloat(b.final_price || 0), 0);
    const gstCollected = totalRevenue - (totalRevenue / 1.18);

    const expenses = await Expense.findAll();
    const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const netProfit = totalRevenue - gstCollected - totalExpenses;

    // Monthly data for chart
    const monthlyRevenue = {};
    paidBookings.forEach(b => {
      const month = new Date(b.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(b.final_price || 0);
    });

    res.json({ totalRevenue, gstCollected, totalExpenses, netProfit, monthlyRevenue, totalBookings: paidBookings.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllExpenses, createExpense, updateExpense, deleteExpense, getBusinessSummary };
