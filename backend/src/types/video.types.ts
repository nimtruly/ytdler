export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  author: string;
  description?: string;
  viewCount?: number;
  uploadDate?: string;
  formats: VideoFormat[];
}

export interface VideoFormat {
  formatId: string;
  ext: string;
  resolution: string;
  filesize?: number;
  formatNote?: string;
  vcodec?: string;
  acodec?: string;
}

export interface DownloadRequest {
  url: string;
  format?: string;
  quality?: string;
}

export interface DownloadProgress {
  percentage: number;
  downloadSpeed: string;
  eta: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
