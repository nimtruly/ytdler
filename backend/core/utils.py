"""
Utility functions for the YouTube downloader.
"""
import re
import logging
from typing import Optional
from urllib.parse import urlparse, parse_qs


logger = logging.getLogger(__name__)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal and invalid characters.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove path separators
    filename = filename.replace("/", "_").replace("\\", "_")
    
    # Remove invalid characters
    filename = re.sub(r'[<>:"|?*]', '', filename)
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Limit length
    if len(filename) > 200:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:190] + ('.' + ext if ext else '')
    
    return filename or "download"


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract video ID from YouTube URL.
    
    Args:
        url: YouTube video URL
        
    Returns:
        Video ID or None if not found
    """
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def validate_youtube_url(url: str) -> bool:
    """
    Validate if URL is a valid YouTube URL.
    
    Args:
        url: URL to validate
        
    Returns:
        True if valid YouTube URL, False otherwise
    """
    try:
        parsed = urlparse(url)
        valid_domains = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com']
        
        if parsed.netloc not in valid_domains:
            return False
        
        # Check if we can extract a video ID
        return extract_video_id(url) is not None
    except Exception as e:
        logger.error(f"Error validating URL: {e}")
        return False


def format_bytes(bytes_size: int) -> str:
    """
    Format bytes to human-readable string.
    
    Args:
        bytes_size: Size in bytes
        
    Returns:
        Formatted string (e.g., "10.5 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} PB"


def format_duration(seconds: int) -> str:
    """
    Format duration in seconds to HH:MM:SS.
    
    Args:
        seconds: Duration in seconds
        
    Returns:
        Formatted duration string
    """
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes:02d}:{secs:02d}"
