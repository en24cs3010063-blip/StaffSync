const { body } = require('express-validator');

const leaveApplicationRules = [
  body('leaveType')
    .isIn(['annual', 'sick', 'casual', 'maternityPaternity', 'unpaid'])
    .withMessage('Valid leave type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().isLength({ min: 5 }).withMessage('Reason must be at least 5 characters long'),
];

const leaveReviewRules = [
  body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'),
  body('rejectionReason')
    .if(body('status').equals('Rejected'))
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a leave request'),
];

module.exports = {
  leaveApplicationRules,
  leaveReviewRules,
};
