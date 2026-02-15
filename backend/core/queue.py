"""
Download queue manager for handling concurrent downloads.
"""
import asyncio
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timedelta

from backend.config import settings
from backend.core.downloader import downloader, DownloadProgress


logger = logging.getLogger(__name__)


class DownloadQueue:
    """Manage concurrent downloads with queue."""
    
    def __init__(self, max_concurrent: int = None):
        self.max_concurrent = max_concurrent or settings.max_concurrent_downloads
        self.semaphore = asyncio.Semaphore(self.max_concurrent)
        self.active_downloads: Dict[str, asyncio.Task] = {}
        self.rate_limits: Dict[str, list] = {}  # IP -> list of timestamps
    
    def check_rate_limit(self, client_ip: str) -> bool:
        """
        Check if client has exceeded rate limit.
        
        Args:
            client_ip: Client IP address
            
        Returns:
            True if within limit, False if exceeded
        """
        now = datetime.utcnow()
        hour_ago = now - timedelta(hours=1)
        
        # Clean old entries
        if client_ip in self.rate_limits:
            self.rate_limits[client_ip] = [
                ts for ts in self.rate_limits[client_ip]
                if ts > hour_ago
            ]
        else:
            self.rate_limits[client_ip] = []
        
        # Check limit
        if len(self.rate_limits[client_ip]) >= settings.rate_limit_per_ip:
            return False
        
        # Add new entry
        self.rate_limits[client_ip].append(now)
        return True
    
    async def add_download(
        self,
        download_id: str,
        url: str,
        format_id: Optional[str] = None,
        audio_only: bool = False,
    ) -> DownloadProgress:
        """
        Add download to queue.
        
        Args:
            download_id: Unique download identifier
            url: YouTube video URL
            format_id: Specific format ID (optional)
            audio_only: Extract audio only
            
        Returns:
            DownloadProgress object
        """
        async def _download():
            async with self.semaphore:
                try:
                    return await downloader.download_video(
                        download_id=download_id,
                        url=url,
                        format_id=format_id,
                        audio_only=audio_only,
                    )
                except Exception as e:
                    logger.error(f"Error in download task {download_id}: {e}")
                    raise
                finally:
                    # Remove from active downloads when complete
                    if download_id in self.active_downloads:
                        del self.active_downloads[download_id]
        
        # Create task
        task = asyncio.create_task(_download())
        self.active_downloads[download_id] = task
        
        # Initialize progress in downloader
        # The actual download starts asynchronously
        # Return the progress object immediately
        progress = downloader.get_download_status(download_id)
        if not progress:
            # If not yet created, wait a bit for task to initialize
            await asyncio.sleep(0.1)
            progress = downloader.get_download_status(download_id)
        
        return progress or DownloadProgress(download_id)
    
    def get_queue_status(self) -> Dict[str, Any]:
        """
        Get current queue status.
        
        Returns:
            Dictionary with queue information
        """
        return {
            "max_concurrent": self.max_concurrent,
            "active_downloads": len(self.active_downloads),
            "available_slots": self.max_concurrent - len(self.active_downloads),
            "active_download_ids": list(self.active_downloads.keys()),
        }
    
    async def cancel_download(self, download_id: str) -> bool:
        """
        Cancel an active download.
        
        Args:
            download_id: Download identifier
            
        Returns:
            True if cancelled, False if not found
        """
        if download_id in self.active_downloads:
            task = self.active_downloads[download_id]
            task.cancel()
            
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            # Update progress
            progress = downloader.get_download_status(download_id)
            if progress:
                progress.status = 'cancelled'
                progress.completed_at = datetime.utcnow()
            
            # Remove from tracking
            del self.active_downloads[download_id]
            return True
        
        return False


# Global queue instance
download_queue = DownloadQueue()
