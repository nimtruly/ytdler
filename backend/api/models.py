"""
API request and response models.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl


class VideoInfoRequest(BaseModel):
    """Request model for video info extraction."""
    url: str = Field(..., description="YouTube video URL")


class VideoInfoResponse(BaseModel):
    """Response model for video information."""
    id: str
    title: str
    description: str
    duration: Optional[int] = None
    thumbnail: Optional[str] = None
    uploader: Optional[str] = None
    upload_date: Optional[str] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    channel: Optional[str] = None
    channel_url: Optional[str] = None
    webpage_url: Optional[str] = None


class FormatInfo(BaseModel):
    """Information about a video format."""
    format_id: Optional[str] = None
    ext: Optional[str] = None
    resolution: Optional[str] = None
    filesize: Optional[int] = None
    fps: Optional[int] = None
    vcodec: Optional[str] = None
    acodec: Optional[str] = None
    format_note: Optional[str] = None


class FormatsRequest(BaseModel):
    """Request model for getting available formats."""
    url: str = Field(..., description="YouTube video URL")


class FormatsResponse(BaseModel):
    """Response model for available formats."""
    video_id: str
    title: str
    formats: List[FormatInfo]


class DownloadRequest(BaseModel):
    """Request model for video download."""
    url: str = Field(..., description="YouTube video URL")
    format_id: Optional[str] = Field(None, description="Specific format ID to download")
    audio_only: bool = Field(False, description="Extract audio only")


class DownloadResponse(BaseModel):
    """Response model for download initiation."""
    download_id: str
    status: str
    message: str


class DownloadStatusResponse(BaseModel):
    """Response model for download status."""
    download_id: str
    status: str
    progress: float
    speed: int
    eta: int
    downloaded_bytes: int
    total_bytes: int
    filename: str
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class QueueStatusResponse(BaseModel):
    """Response model for queue status."""
    max_concurrent: int
    active_downloads: int
    available_slots: int
    active_download_ids: List[str]


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: str
