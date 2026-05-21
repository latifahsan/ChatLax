import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  markAsRead,
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/:chatId', getMessages);
router.post('/:chatId', sendMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/react', reactToMessage);
router.post('/:chatId/read', markAsRead);

export default router;
