import { Request, Response } from "express";
import { YouTubeService } from "../services/youtube.service";
import { DownloadRequest, ErrorResponse } from "../types/video.types";
import fs from "fs";

export class VideoController {
  private youtubeService: YouTubeService;

  constructor() {
    this.youtubeService = new YouTubeService();
  }

  getVideoInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== "string") {
        res.status(400).json({
          error: "URL parameter is required",
        } as ErrorResponse);
        return;
      }

      if (!this.youtubeService.validateUrl(url)) {
        res.status(400).json({
          error: "Invalid YouTube URL",
        } as ErrorResponse);
        return;
      }

      const videoInfo = await this.youtubeService.getVideoInfo(url);
      res.json(videoInfo);
    } catch (error) {
      console.error("Error fetching video info:", error);
      res.status(500).json({
        error: "Failed to fetch video information",
        details: error instanceof Error ? error.message : "Unknown error",
      } as ErrorResponse);
    }
  };

  downloadVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, formatId } = req.body as DownloadRequest & {
        formatId?: string;
      };

      if (!url) {
        res.status(400).json({
          error: "URL is required",
        } as ErrorResponse);
        return;
      }

      if (!this.youtubeService.validateUrl(url)) {
        res.status(400).json({
          error: "Invalid YouTube URL",
        } as ErrorResponse);
        return;
      }

      console.log("Download request for URL:", url);
      const { filePath, filename } = await this.youtubeService.downloadVideo(
        url,
        formatId,
      );
      console.log("File ready for streaming:", filePath);

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        throw new Error("File was downloaded but no longer exists");
      }

      // Get file size for Content-Length header
      const stat = fs.statSync(filePath);

      // Set headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", stat.size);

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);

      fileStream.pipe(res);

      // Clean up the file after sending
      fileStream.on("close", () => {
        console.log("File stream closed, cleaning up...");
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
          else console.log("File deleted successfully");
        });
      });

      fileStream.on("error", (err) => {
        console.error("Error streaming file:", err);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Failed to stream video file",
            details: err.message,
          } as ErrorResponse);
        }
        // Clean up on error
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr)
            console.error("Error deleting file after error:", unlinkErr);
        });
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to download video",
          details: error instanceof Error ? error.message : "Unknown error",
        } as ErrorResponse);
      }
    }
  };
}
