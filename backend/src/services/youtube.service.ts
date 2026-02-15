import YTDlpWrap from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import { VideoInfo, VideoFormat } from "../types/video.types";

export class YouTubeService {
  private ytDlp: YTDlpWrap;
  private downloadsDir: string;
  private ytDlpPath: string;
  private initialized: boolean = false;

  constructor() {
    const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
    this.ytDlpPath = path.join(process.cwd(), "bin", binaryName);
    this.ytDlp = new YTDlpWrap(this.ytDlpPath);
    this.downloadsDir = path.join(process.cwd(), "downloads");
  }

  private async ensureYtDlpExists(): Promise<void> {
    if (this.initialized) return;

    const binDir = path.join(process.cwd(), "bin");
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true });
    }

    if (!fs.existsSync(this.ytDlpPath)) {
      console.log("Downloading yt-dlp binary...");
      try {
        await YTDlpWrap.downloadFromGithub(this.ytDlpPath);
        console.log("yt-dlp binary downloaded successfully");
      } catch (error) {
        throw new Error(
          `Failed to download yt-dlp: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
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
        .filter(
          (f: any) => f.ext && (f.vcodec !== "none" || f.acodec !== "none"),
        )
        .map((f: any) => ({
          formatId: f.format_id,
          ext: f.ext,
          resolution: f.resolution || (f.height ? `${f.height}p` : "audio"),
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
      throw new Error(
        `Failed to fetch video info: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async downloadVideo(
    url: string,
    formatId?: string,
  ): Promise<{ filePath: string; filename: string }> {
    await this.ensureYtDlpExists();

    try {
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const outputTemplate = path.join(
        this.downloadsDir,
        `${timestamp}_%(title)s.%(ext)s`,
      );

      const args = ["--output", outputTemplate, "--no-playlist"];

      if (formatId) {
        args.push("--format", formatId);
      } else {
        // Default to best quality
        args.push("--format", "bestvideo+bestaudio/best");
      }

      args.push(url);

      console.log("Starting download with args:", args);
      await this.ytDlp.execPromise(args);
      console.log("Download completed, searching for file...");

      // Find the downloaded file
      const files = fs
        .readdirSync(this.downloadsDir)
        .map((filename) => ({
          filename,
          path: path.join(this.downloadsDir, filename),
          time: fs
            .statSync(path.join(this.downloadsDir, filename))
            .mtime.getTime(),
        }))
        .filter((file) => file.filename.startsWith(timestamp.toString()))
        .sort((a, b) => b.time - a.time);

      if (files.length === 0) {
        console.error("No files found with timestamp:", timestamp);
        console.error("Files in directory:", fs.readdirSync(this.downloadsDir));
        throw new Error("Download completed but file not found");
      }

      const downloadedFile = files[0];
      console.log("Found downloaded file:", downloadedFile.filename);

      // Remove timestamp prefix from filename for cleaner download name
      const cleanFilename = downloadedFile.filename.replace(/^\d+_/, "");

      return {
        filePath: downloadedFile.path,
        filename: cleanFilename,
      };
    } catch (error) {
      console.error("Download error:", error);
      throw new Error(
        `Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  validateUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  }
}
