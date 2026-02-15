"""
Configuration settings for the YouTube downloader backend.
"""
import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application settings
    app_name: str = "YouTube Downloader API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Directory settings
    base_dir: Path = Path(__file__).parent.parent
    download_dir: Path = base_dir / "downloads"
    log_dir: Path = base_dir / "logs"
    
    # Download settings
    max_file_size_mb: int = 500  # Maximum file size in MB
    max_concurrent_downloads: int = 3
    download_timeout: int = 3600  # Timeout in seconds
    
    # Rate limiting
    rate_limit_per_ip: int = 10  # Downloads per hour
    
    # yt-dlp settings
    ytdlp_format: str = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
    ytdlp_extract_audio: bool = False
    ytdlp_audio_format: str = "mp3"
    ytdlp_audio_quality: str = "192"
    
    # Proxy settings (optional)
    proxy_url: Optional[str] = None
    
    # Logging settings
    log_level: str = "INFO"
    log_file: str = "ytdler.log"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure directories exist
        self.download_dir.mkdir(parents=True, exist_ok=True)
        self.log_dir.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
