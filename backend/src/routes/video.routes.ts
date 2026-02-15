import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';

const router = Router();
const videoController = new VideoController();

// Get video information
router.get('/info', videoController.getVideoInfo);

// Download video
router.post('/download', videoController.downloadVideo);

export default router;
