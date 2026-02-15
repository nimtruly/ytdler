import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/video.routes';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'YouTube Downloader API',
    version: '1.0.0',
    endpoints: {
      getInfo: 'GET /api/video/info?url=<youtube_url>',
      download: 'POST /api/video/download',
    },
  });
});

app.use('/api/video', videoRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Downloads will be saved to: ${downloadsDir}`);
});

export default app;
