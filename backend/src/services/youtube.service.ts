import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';
import { VideoInfo, VideoFormat } from '../types/video.types';

export class YouTubeService {
  private ytDlp: YTDlpWrap;
  private downloadsDir: string;
  private ytDlpPath: string;
  private initialized: boolean = false;

  constructor() {
    this.ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp');
    this.ytDlp = new YTDlpWrap(this.ytDlpPath);
    this.downloadsDir = path.join(process.cwd(), 'downloads');
  }

  private async ensureYtDlpExists(): Promise<void> {
    if (this.initialized) return;

    const binDir = path.join(process.cwd(), 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    if (!fs.existsSync(this.ytDlpPath)) {
      console.log('Downloading yt-dlp binary...');
      try {
        await YTDlpWrap.downloadFromGithub(this.ytDlpPath);
        console.log('yt-dlp binary downloaded successfully');
      } catch (error) {
        throw new Error(`Failed to download yt-dlp: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.initialized = true;
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    await this.ensureYtDlpExists();
    
    try {
      const info = await this.ytDlp.getVideoInfo(url);
      
      // Extract relevant format information
      const formats: VideoFormat[] = (info.formats || [])
        .filter((f: any) => f.ext && (f.vcodec !== 'none' || f.acodec !== 'none'))
        .map((f: any) => ({
          formatId: f.format_id,
          ext: f.ext,
          resolution: f.resolution || (f.height ? `${f.height}p` : 'audio'),
          filesize: f.filesize,
          formatNote: f.format_note,
          vcodec: f.vcodec,
          acodec: f.acodec,
        }));

      return {
        id: info.id,
        title: info.title,
        duration: info.duration,
        thumbnail: info.thumbnail,
        author: info.uploader || info.channel,
        description: info.description,
        viewCount: info.view_count,
        uploadDate: info.upload_date,
        formats,
      };
    } catch (error) {
      throw new Error(`Failed to fetch video info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadVideo(url: string, formatId?: string): Promise<string> {
    await this.ensureYtDlpExists();
    
    try {
      const outputTemplate = path.join(this.downloadsDir, '%(title)s.%(ext)s');
      
      const args = [
        '--output', outputTemplate,
        '--no-playlist',
      ];

      if (formatId) {
        args.push('--format', formatId);
      } else {
        // Default to best quality
        args.push('--format', 'bestvideo+bestaudio/best');
      }

      args.push(url);

      await this.ytDlp.execPromise(args);
      
      return 'Download completed successfully';
    } catch (error) {
      throw new Error(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  }
}
