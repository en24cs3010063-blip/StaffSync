const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../validators/authValidator');
const {
  leaveApplicationRules,
  leaveReviewRules,
} = require('../validators/leaveValidator');

router.use(protect);

router.post('/', leaveApplicationRules, validate, applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/', authorize('admin', 'manager'), getLeaves);
router.patch('/:id/review', authorize('admin', 'manager'), leaveReviewRules, validate, reviewLeave);
router.patch('/:id/cancel', cancelLeave);

module.exports = router;
