const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getManagersList,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const { validate, registerRules } = require('../validators/authValidator');

router.use(protect);

router.get('/managers', getManagersList);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('admin'), registerRules, validate, createEmployee);
router.put('/:id', authorize('admin', 'manager'), updateEmployee);
router.patch('/:id/status', authorize('admin'), toggleEmployeeStatus);

module.exports = router;
