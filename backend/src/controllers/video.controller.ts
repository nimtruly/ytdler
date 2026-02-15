import { Request, Response } from 'express';
import { YouTubeService } from '../services/youtube.service';
import { DownloadRequest, ErrorResponse } from '../types/video.types';

export class VideoController {
  private youtubeService: YouTubeService;

  constructor() {
    this.youtubeService = new YouTubeService();
  }

  getVideoInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        res.status(400).json({
          error: 'URL parameter is required',
        } as ErrorResponse);
        return;
      }

      if (!this.youtubeService.validateUrl(url)) {
        res.status(400).json({
          error: 'Invalid YouTube URL',
        } as ErrorResponse);
        return;
      }

      const videoInfo = await this.youtubeService.getVideoInfo(url);
      res.json(videoInfo);
    } catch (error) {
      console.error('Error fetching video info:', error);
      res.status(500).json({
        error: 'Failed to fetch video information',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse);
    }
  };

  downloadVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, formatId } = req.body as DownloadRequest & { formatId?: string };

      if (!url) {
        res.status(400).json({
          error: 'URL is required',
        } as ErrorResponse);
        return;
      }

      if (!this.youtubeService.validateUrl(url)) {
        res.status(400).json({
          error: 'Invalid YouTube URL',
        } as ErrorResponse);
        return;
      }

      const result = await this.youtubeService.downloadVideo(url, formatId);
      res.json({ message: result });
    } catch (error) {
      console.error('Error downloading video:', error);
      res.status(500).json({
        error: 'Failed to download video',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse);
    }
  };
}
