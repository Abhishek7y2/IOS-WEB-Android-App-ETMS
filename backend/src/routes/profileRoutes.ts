import express from 'express';
import { 
  getProfile, 
  updatePreferences, 
  updatePassword, 
  getAdminTeam,
  exportUserData
} from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, getProfile);
router.get('/export-data', authenticate, exportUserData);
router.put('/preferences', authenticate, updatePreferences);
router.put('/password', authenticate, updatePassword);
router.get('/team', authenticate, getAdminTeam);

export default router;
