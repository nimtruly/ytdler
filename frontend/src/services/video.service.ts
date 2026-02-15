import { VideoInfo, DownloadRequest, ErrorResponse } from '../types/video.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class VideoService {
  static async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/video/info?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.error || 'Failed to fetch video info');
      }
      
      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch video info');
    }
  }

  static async downloadVideo(request: DownloadRequest): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/video/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.error || 'Failed to download video');
      }
      
      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to download video');
    }
  }

  static validateUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  }
}
