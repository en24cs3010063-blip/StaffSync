const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getManagerAnalytics,
  getEmployeeAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminAnalytics);
router.get('/manager', authorize('admin', 'manager'), getManagerAnalytics);
router.get('/employee', getEmployeeAnalytics);

module.exports = router;
