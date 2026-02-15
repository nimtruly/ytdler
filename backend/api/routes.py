"""
API route handlers.
"""
import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from backend.api.models import (
    VideoInfoRequest,
    VideoInfoResponse,
    FormatsRequest,
    FormatsResponse,
    FormatInfo,
    DownloadRequest,
    DownloadResponse,
    DownloadStatusResponse,
    QueueStatusResponse,
    ErrorResponse,
)
from backend.core.downloader import downloader
from backend.core.queue import download_queue


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.post(
    "/video/info",
    response_model=VideoInfoResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Get video information",
    description="Extract metadata from a YouTube video URL without downloading",
)
async def get_video_info(request: VideoInfoRequest):
    """
    Extract video information from YouTube URL.
    
    Args:
        request: VideoInfoRequest with URL
        
    Returns:
        Video metadata including title, duration, thumbnail, etc.
        
    Raises:
        HTTPException: If URL is invalid or extraction fails
    """
    try:
        info = await downloader.get_video_info(request.url)
        return VideoInfoResponse(**info)
    except ValueError as e:
        logger.warning(f"Invalid URL: {request.url}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error extracting video info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract video information: {str(e)}"
        )


@router.post(
    "/video/formats",
    response_model=FormatsResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Get available formats",
    description="Get all available video formats and quality options for a YouTube video",
)
async def get_video_formats(request: FormatsRequest):
    """
    Get available video formats.
    
    Args:
        request: FormatsRequest with URL
        
    Returns:
        List of available formats with details
        
    Raises:
        HTTPException: If URL is invalid or extraction fails
    """
    try:
        formats_data = await downloader.get_available_formats(request.url)
        
        # Convert formats to FormatInfo models
        formats = [FormatInfo(**fmt) for fmt in formats_data['formats']]
        
        return FormatsResponse(
            video_id=formats_data['video_id'],
            title=formats_data['title'],
            formats=formats
        )
    except ValueError as e:
        logger.warning(f"Invalid URL: {request.url}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error getting formats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available formats: {str(e)}"
        )


@router.post(
    "/video/download",
    response_model=DownloadResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Download video",
    description="Initiate a video download. Returns a download ID for tracking progress",
)
async def download_video(request_data: DownloadRequest, request: Request):
    """
    Initiate video download.
    
    Args:
        request_data: DownloadRequest with URL and options
        request: FastAPI Request object for client IP
        
    Returns:
        Download ID and initial status
        
    Raises:
        HTTPException: If URL is invalid, rate limit exceeded, or download fails
    """
    # Get client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    if not download_queue.check_rate_limit(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )
    
    # Generate unique download ID
    download_id = str(uuid.uuid4())
    
    try:
        # Add to download queue
        progress = await download_queue.add_download(
            download_id=download_id,
            url=request_data.url,
            format_id=request_data.format_id,
            audio_only=request_data.audio_only,
        )
        
        logger.info(f"Download initiated: {download_id} for URL: {request_data.url}")
        
        return DownloadResponse(
            download_id=download_id,
            status=progress.status if progress else "queued",
            message="Download initiated successfully"
        )
    except ValueError as e:
        logger.warning(f"Invalid request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error initiating download: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate download: {str(e)}"
        )


@router.get(
    "/download/status/{download_id}",
    response_model=DownloadStatusResponse,
    responses={
        404: {"model": ErrorResponse},
    },
    summary="Get download status",
    description="Check the progress and status of an ongoing or completed download",
)
async def get_download_status(download_id: str):
    """
    Get download progress status.
    
    Args:
        download_id: Unique download identifier
        
    Returns:
        Download status with progress information
        
    Raises:
        HTTPException: If download not found
    """
    progress = downloader.get_download_status(download_id)
    
    if not progress:
        logger.warning(f"Download not found: {download_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Download {download_id} not found"
        )
    
    return DownloadStatusResponse(**progress.to_dict())


@router.get(
    "/queue/status",
    response_model=QueueStatusResponse,
    summary="Get queue status",
    description="Get information about the download queue and active downloads",
)
async def get_queue_status():
    """
    Get download queue status.
    
    Returns:
        Queue status with active download information
    """
    status_info = download_queue.get_queue_status()
    return QueueStatusResponse(**status_info)


@router.delete(
    "/download/{download_id}",
    responses={
        404: {"model": ErrorResponse},
    },
    summary="Cancel download",
    description="Cancel an active download",
)
async def cancel_download(download_id: str):
    """
    Cancel an active download.
    
    Args:
        download_id: Unique download identifier
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If download not found
    """
    cancelled = await download_queue.cancel_download(download_id)
    
    if not cancelled:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Download {download_id} not found or already completed"
        )
    
    return {"message": f"Download {download_id} cancelled successfully"}
