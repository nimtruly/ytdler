"""
YouTube downloader using yt-dlp library.
"""
import asyncio
import logging
import os
from pathlib import Path
from typing import Dict, Any, Optional, Callable
from datetime import datetime

import yt_dlp

from backend.config import settings
from backend.core.utils import sanitize_filename, validate_youtube_url


logger = logging.getLogger(__name__)


class DownloadProgress:
    """Track download progress."""
    
    def __init__(self, download_id: str):
        self.download_id = download_id
        self.status = "pending"
        self.progress = 0.0
        self.speed = 0
        self.eta = 0
        self.downloaded_bytes = 0
        self.total_bytes = 0
        self.filename = ""
        self.error = None
        self.started_at = None
        self.completed_at = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert progress to dictionary."""
        return {
            "download_id": self.download_id,
            "status": self.status,
            "progress": round(self.progress, 2),
            "speed": self.speed,
            "eta": self.eta,
            "downloaded_bytes": self.downloaded_bytes,
            "total_bytes": self.total_bytes,
            "filename": self.filename,
            "error": self.error,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class YouTubeDownloader:
    """YouTube video downloader using yt-dlp."""
    
    def __init__(self):
        self.downloads: Dict[str, DownloadProgress] = {}
    
    def _get_ydl_opts(self, output_path: str, progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Get yt-dlp options.
        
        Args:
            output_path: Output file path template
            progress_callback: Callback function for progress updates
            
        Returns:
            Dictionary of yt-dlp options
        """
        opts = {
            'format': settings.ytdlp_format,
            'outtmpl': output_path,
            'quiet': False,
            'no_warnings': False,
            'extract_flat': False,
            'socket_timeout': 30,
        }
        
        if progress_callback:
            opts['progress_hooks'] = [progress_callback]
        
        if settings.proxy_url:
            opts['proxy'] = settings.proxy_url
        
        # Add file size limit
        if settings.max_file_size_mb > 0:
            opts['max_filesize'] = settings.max_file_size_mb * 1024 * 1024
        
        return opts
    
    async def get_video_info(self, url: str) -> Dict[str, Any]:
        """
        Extract video information without downloading.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Dictionary with video information
            
        Raises:
            ValueError: If URL is invalid
            Exception: If extraction fails
        """
        if not validate_youtube_url(url):
            raise ValueError("Invalid YouTube URL")
        
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
            }
            
            if settings.proxy_url:
                ydl_opts['proxy'] = settings.proxy_url
            
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(
                None,
                self._extract_info,
                url,
                ydl_opts
            )
            
            # Extract relevant information
            result = {
                'id': info.get('id'),
                'title': info.get('title'),
                'description': info.get('description', '')[:500],  # Truncate long descriptions
                'duration': info.get('duration'),
                'thumbnail': info.get('thumbnail'),
                'uploader': info.get('uploader'),
                'upload_date': info.get('upload_date'),
                'view_count': info.get('view_count'),
                'like_count': info.get('like_count'),
                'channel': info.get('channel'),
                'channel_url': info.get('channel_url'),
                'webpage_url': info.get('webpage_url'),
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error extracting video info: {e}")
            raise Exception(f"Failed to extract video information: {str(e)}")
    
    def _extract_info(self, url: str, ydl_opts: Dict[str, Any]) -> Dict[str, Any]:
        """Extract info synchronously (run in thread pool)."""
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)
    
    async def get_available_formats(self, url: str) -> Dict[str, Any]:
        """
        Get available video formats.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Dictionary with available formats
            
        Raises:
            ValueError: If URL is invalid
            Exception: If extraction fails
        """
        if not validate_youtube_url(url):
            raise ValueError("Invalid YouTube URL")
        
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
            }
            
            if settings.proxy_url:
                ydl_opts['proxy'] = settings.proxy_url
            
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(
                None,
                self._extract_info,
                url,
                ydl_opts
            )
            
            formats = []
            for fmt in info.get('formats', []):
                format_info = {
                    'format_id': fmt.get('format_id'),
                    'ext': fmt.get('ext'),
                    'resolution': fmt.get('resolution'),
                    'filesize': fmt.get('filesize'),
                    'fps': fmt.get('fps'),
                    'vcodec': fmt.get('vcodec'),
                    'acodec': fmt.get('acodec'),
                    'format_note': fmt.get('format_note'),
                }
                formats.append(format_info)
            
            return {
                'video_id': info.get('id'),
                'title': info.get('title'),
                'formats': formats,
            }
            
        except Exception as e:
            logger.error(f"Error getting formats: {e}")
            raise Exception(f"Failed to get available formats: {str(e)}")
    
    async def download_video(
        self,
        download_id: str,
        url: str,
        format_id: Optional[str] = None,
        audio_only: bool = False,
    ) -> DownloadProgress:
        """
        Download a YouTube video.
        
        Args:
            download_id: Unique download identifier
            url: YouTube video URL
            format_id: Specific format ID to download (optional)
            audio_only: Extract audio only
            
        Returns:
            DownloadProgress object
            
        Raises:
            ValueError: If URL is invalid or download already exists
            Exception: If download fails
        """
        if not validate_youtube_url(url):
            raise ValueError("Invalid YouTube URL")
        
        if download_id in self.downloads:
            raise ValueError(f"Download {download_id} already exists")
        
        # Create progress tracker
        progress = DownloadProgress(download_id)
        progress.status = "starting"
        progress.started_at = datetime.utcnow()
        self.downloads[download_id] = progress
        
        try:
            # Prepare output path
            output_template = str(settings.download_dir / f"{download_id}_%(title)s.%(ext)s")
            
            # Progress hook
            def progress_hook(d):
                if d['status'] == 'downloading':
                    progress.status = 'downloading'
                    progress.downloaded_bytes = d.get('downloaded_bytes', 0)
                    progress.total_bytes = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
                    
                    if progress.total_bytes > 0:
                        progress.progress = (progress.downloaded_bytes / progress.total_bytes) * 100
                    
                    progress.speed = d.get('speed', 0) or 0
                    progress.eta = d.get('eta', 0) or 0
                    progress.filename = d.get('filename', '')
                    
                elif d['status'] == 'finished':
                    progress.status = 'processing'
                    progress.filename = d.get('filename', '')
                    progress.progress = 100.0
            
            # Build yt-dlp options
            ydl_opts = self._get_ydl_opts(output_template, progress_hook)
            
            if format_id:
                ydl_opts['format'] = format_id
            elif audio_only:
                ydl_opts['format'] = 'bestaudio/best'
                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': settings.ytdlp_audio_format,
                    'preferredquality': settings.ytdlp_audio_quality,
                }]
            
            # Download in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self._download_video_sync,
                url,
                ydl_opts
            )
            
            progress.status = 'completed'
            progress.progress = 100.0
            progress.completed_at = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Download error for {download_id}: {e}")
            progress.status = 'failed'
            progress.error = str(e)
            progress.completed_at = datetime.utcnow()
            raise Exception(f"Download failed: {str(e)}")
        
        return progress
    
    def _download_video_sync(self, url: str, ydl_opts: Dict[str, Any]) -> None:
        """Download video synchronously (run in thread pool)."""
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    
    def get_download_status(self, download_id: str) -> Optional[DownloadProgress]:
        """
        Get download progress status.
        
        Args:
            download_id: Download identifier
            
        Returns:
            DownloadProgress object or None if not found
        """
        return self.downloads.get(download_id)
    
    def remove_download(self, download_id: str) -> bool:
        """
        Remove download from tracking.
        
        Args:
            download_id: Download identifier
            
        Returns:
            True if removed, False if not found
        """
        if download_id in self.downloads:
            del self.downloads[download_id]
            return True
        return False


# Global downloader instance
downloader = YouTubeDownloader()
