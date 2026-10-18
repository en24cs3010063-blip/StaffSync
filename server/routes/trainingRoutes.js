const express = require('express');
const router = express.Router();
const {
  getTrainings,
  getTrainingById,
  createTraining,
  assignEmployees,
  updateProgress,
  updateTraining,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getTrainings);
router.get('/:id', getTrainingById);
router.post('/', authorize('admin', 'manager'), createTraining);
router.post('/:id/assign', authorize('admin', 'manager'), assignEmployees);
router.patch('/:id/progress', updateProgress);
router.put('/:id', authorize('admin', 'manager'), updateTraining);
router.delete('/:id', authorize('admin'), deleteTraining);

module.exports = router;
