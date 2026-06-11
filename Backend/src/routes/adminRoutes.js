import express from 'express';
import {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getActivityLogs,
  getAnalytics
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Admin')); // All admin routes require Admin role

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/logs', getActivityLogs);
router.get('/analytics', getAnalytics);

export default router;
