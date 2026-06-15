const express = require('express');
const router = express.Router();
const { getPlatformStats, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
