const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getTeamAttendance,
  getOrganizationAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendance);
router.get('/team', authorize('admin', 'manager'), getTeamAttendance);
router.get('/organization', authorize('admin'), getOrganizationAttendance);

module.exports = router;
