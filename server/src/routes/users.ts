import { Router } from 'express';
import { updateProfile, getUserById } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.put('/profile', updateProfile);
router.get('/:userId', getUserById);

export default router;
