"""
Main application entry point for YouTube Downloader API.
"""
import logging
import sys
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.api.routes import router
from backend.api.models import HealthResponse


# Configure logging
def setup_logging():
    """Configure application logging."""
    log_file = settings.log_dir / settings.log_file
    
    # Create formatters and handlers
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    formatter = logging.Formatter(log_format)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if settings.debug else logging.INFO)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Suppress noisy loggers
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('asyncio').setLevel(logging.WARNING)


# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    YouTube Downloader API - Download videos from YouTube with ease.
    
    ## Features
    - Extract video information without downloading
    - Get available video formats and quality options
    - Download videos in various formats and qualities
    - Track download progress in real-time
    - Audio-only extraction support
    - Download queue management
    
    ## Usage
    1. Use `/api/video/info` to get video metadata
    2. Use `/api/video/formats` to see available formats
    3. Use `/api/video/download` to start a download
    4. Use `/api/download/status/{id}` to track progress
    
    ## Legal Notice
    Please respect YouTube's Terms of Service and copyright laws.
    This tool is intended for personal and educational use only.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# Include API routes
app.include_router(router)


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint - redirect to docs."""
    return {
        "message": "YouTube Downloader API",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status information
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        timestamp=datetime.utcnow().isoformat()
    )


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Download directory: {settings.download_dir}")
    logger.info(f"Log directory: {settings.log_dir}")
    logger.info(f"Max concurrent downloads: {settings.max_concurrent_downloads}")
    logger.info(f"Max file size: {settings.max_file_size_mb} MB")
    
    # Verify yt-dlp is available
    try:
        import yt_dlp
        logger.info(f"yt-dlp version: {yt_dlp.version.__version__}")
    except Exception as e:
        logger.error(f"Failed to import yt-dlp: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info(f"Shutting down {settings.app_name}")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "backend.app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
