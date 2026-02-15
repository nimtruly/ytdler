import {
  VideoInfo,
  DownloadRequest,
  ErrorResponse,
} from "../types/video.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class VideoService {
  static async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/video/info?url=${encodeURIComponent(url)}`,
      );

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.error || "Failed to fetch video info");
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch video info");
    }
  }

  static async downloadVideo(
    request: DownloadRequest,
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/video/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      // Check content type to determine if it's an error or file
      const contentType = response.headers.get("Content-Type") || "";

      if (!response.ok) {
        // It's an error response
        if (contentType.includes("application/json")) {
          const error: ErrorResponse = await response.json();
          throw new Error(
            error.error || error.details || "Failed to download video",
          );
        } else {
          throw new Error(`Download failed with status: ${response.status}`);
        }
      }

      // If content type is JSON even with 200 status, it's likely an error
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        // Old API format that returned JSON
        return { message: data.message || "Download completed" };
      }

      // It's a file download - get the filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "video.mp4";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=["']?([^"';\n]*)["']?/,
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      console.log("Downloading file:", filename);

      // Download the file
      const blob = await response.blob();
      console.log("Blob size:", blob.size, "bytes");

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log("Download cleanup completed");
      }, 100);

      return { message: "Download completed successfully" };
    } catch (error) {
      console.error("Download error:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to download video");
    }
  }

  static validateUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  }
}
