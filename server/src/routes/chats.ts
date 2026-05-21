import { Router } from 'express';
import {
  getChats,
  getOrCreateChat,
  createGroupChat,
  updateGroupChat,
  pinMessage,
  searchUsers,
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getChats);
router.post('/private', getOrCreateChat);
router.post('/group', createGroupChat);
router.put('/:chatId', updateGroupChat);
router.put('/:chatId/pin', pinMessage);
router.get('/search/users', searchUsers);

export default router;
