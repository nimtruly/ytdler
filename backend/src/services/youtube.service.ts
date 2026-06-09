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
      const info = await this.ytDlp.getVideoInfo([url, "--js-runtimes", "node"]);

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
    options?: {
      formatId?: string;
      format?: string;
      quality?: string;
    },
  ): Promise<{ filePath: string; filename: string }> {
    await this.ensureYtDlpExists();

    try {
      const formatId = options?.formatId;
      const format = options?.format;
      const quality = options?.quality;

      // Determine quality suffix to append to filename
      let suffix = "";
      if (format === "audio") {
        suffix = ` (${quality || "320kbps"})`;
      } else {
        if (quality && quality !== "best" && quality !== "highest") {
          suffix = ` (${quality})`;
        } else {
          try {
            // Get video info to find the actual max resolution for "best"/"highest"
            const info = await this.getVideoInfo(url);
            const heights = info.formats
              ?.filter((f: any) => f.vcodec && f.vcodec !== "none")
              ?.map((f: any) => {
                const match = f.resolution.match(/(\d+)x(\d+)/);
                if (match) return parseInt(match[2]);
                const h = parseInt(f.resolution);
                return isNaN(h) ? 0 : h;
              }) || [];
            const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;
            if (maxHeight > 0) {
              if (maxHeight >= 8640) suffix = " (16K)";
              else if (maxHeight >= 4320) suffix = " (8K)";
              else if (maxHeight >= 2160) suffix = " (4K)";
              else if (maxHeight >= 1440) suffix = " (1440p)";
              else suffix = ` (${maxHeight}p)`;
            }
          } catch (e) {
            console.error("Failed to fetch video info for suffix:", e);
            suffix = " (Best)";
          }
        }
      }

      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const outputTemplate = path.join(
        this.downloadsDir,
        `${timestamp}_%(title)s.%(ext)s`,
      );

      const args = ["--output", outputTemplate, "--no-playlist", "--js-runtimes", "node"];

      if (formatId) {
        // If a specific format is selected, append +bestaudio/best to ensure video formats have audio
        // but keep it as-is for pure audio streams
        args.push("--format", `${formatId}+bestaudio/best/best`);
      } else if (format === "audio") {
        args.push("--format", "bestaudio/best");
        args.push("--extract-audio");
        args.push("--audio-format", "mp3");
      } else {
        // Video download by quality
        if (quality && quality !== "best") {
          const height = parseInt(quality);
          if (!isNaN(height)) {
            args.push("--format", `bestvideo[height<=${height}]+bestaudio/best`);
          } else {
            args.push("--format", "bestvideo+bestaudio/best");
          }
        } else {
          args.push("--format", "bestvideo+bestaudio/best");
        }
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

      // Remove timestamp prefix from filename, split extension, and inject quality suffix
      const baseFilename = downloadedFile.filename.replace(/^\d+_/, "");
      const ext = path.extname(baseFilename);
      const nameWithoutExt = path.basename(baseFilename, ext);
      const cleanFilename = `${nameWithoutExt}${suffix}${ext}`;

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
