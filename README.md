# ytdler - YouTube Downloader API

A robust, feature-rich YouTube video downloader backend built with Python, FastAPI, and yt-dlp.

## Features

- 🎥 **Video Information Extraction** - Get metadata without downloading
- 📊 **Format Selection** - Choose from available quality options
- ⬇️ **Smart Downloads** - Download videos with progress tracking
- 🎵 **Audio Extraction** - Extract audio-only files (MP3, M4A, etc.)
- 📝 **Queue Management** - Handle multiple concurrent downloads
- 🔒 **Rate Limiting** - Prevent abuse with IP-based rate limiting
- 🚀 **Fast & Async** - Built on FastAPI for high performance
- 📈 **Real-time Progress** - Track download speed, ETA, and progress

## Tech Stack

- **Language**: Python 3.8+
- **Framework**: FastAPI
- **Core Library**: yt-dlp (most robust YouTube downloader)
- **Server**: Uvicorn (ASGI server)

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- ffmpeg (optional, for audio extraction and post-processing)

#### Installing ffmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/nimtruly/ytdler.git
cd ytdler
```

2. **Create a virtual environment:**
```bash
python -m venv venv

# Activate on Linux/macOS:
source venv/bin/activate

# Activate on Windows:
venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r backend/requirements.txt
```

4. **Configure settings (optional):**

Create a `.env` file in the project root to customize settings:

```env
# Server settings
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Download settings
MAX_FILE_SIZE_MB=500
MAX_CONCURRENT_DOWNLOADS=3
DOWNLOAD_TIMEOUT=3600

# Rate limiting
RATE_LIMIT_PER_IP=10

# Logging
LOG_LEVEL=INFO
LOG_FILE=ytdler.log

# Proxy (optional)
# PROXY_URL=http://proxy.example.com:8080
```

## Usage

### Starting the Server

```bash
cd backend
python app.py
```

Or using uvicorn directly:

```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### 1. Get Video Information

Extract video metadata without downloading.

```bash
curl -X POST "http://localhost:8000/api/video/info" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

**Response:**
```json
{
  "id": "VIDEO_ID",
  "title": "Video Title",
  "description": "Video description...",
  "duration": 300,
  "thumbnail": "https://...",
  "uploader": "Channel Name",
  "view_count": 1000000,
  "like_count": 50000
}
```

#### 2. Get Available Formats

List all available video formats and quality options.

```bash
curl -X POST "http://localhost:8000/api/video/formats" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

**Response:**
```json
{
  "video_id": "VIDEO_ID",
  "title": "Video Title",
  "formats": [
    {
      "format_id": "137",
      "ext": "mp4",
      "resolution": "1920x1080",
      "filesize": 52428800,
      "fps": 30,
      "vcodec": "avc1.640028",
      "acodec": "none"
    }
  ]
}
```

#### 3. Download Video

Initiate a video download.

**Basic download (best quality):**
```bash
curl -X POST "http://localhost:8000/api/video/download" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

**Download specific format:**
```bash
curl -X POST "http://localhost:8000/api/video/download" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "format_id": "137"
  }'
```

**Extract audio only:**
```bash
curl -X POST "http://localhost:8000/api/video/download" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "audio_only": true
  }'
```

**Response:**
```json
{
  "download_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "starting",
  "message": "Download initiated successfully"
}
```

#### 4. Check Download Status

Track download progress using the download ID.

```bash
curl "http://localhost:8000/api/download/status/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "download_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "downloading",
  "progress": 45.5,
  "speed": 1048576,
  "eta": 30,
  "downloaded_bytes": 23592960,
  "total_bytes": 52428800,
  "filename": "/path/to/video.mp4",
  "error": null,
  "started_at": "2024-01-01T12:00:00",
  "completed_at": null
}
```

**Status values:**
- `pending` - Download queued
- `starting` - Initializing download
- `downloading` - Download in progress
- `processing` - Post-processing (e.g., audio extraction)
- `completed` - Download finished
- `failed` - Download failed
- `cancelled` - Download cancelled

#### 5. Get Queue Status

Check the download queue status.

```bash
curl "http://localhost:8000/api/queue/status"
```

**Response:**
```json
{
  "max_concurrent": 3,
  "active_downloads": 2,
  "available_slots": 1,
  "active_download_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

#### 6. Cancel Download

Cancel an active download.

```bash
curl -X DELETE "http://localhost:8000/api/download/550e8400-e29b-41d4-a716-446655440000"
```

#### 7. Health Check

Check API health status.

```bash
curl "http://localhost:8000/health"
```

## Configuration Options

All settings can be configured via environment variables or `.env` file:

| Setting | Default | Description |
|---------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host address |
| `PORT` | `8000` | Server port |
| `DEBUG` | `false` | Enable debug mode |
| `MAX_FILE_SIZE_MB` | `500` | Maximum file size limit |
| `MAX_CONCURRENT_DOWNLOADS` | `3` | Max concurrent downloads |
| `DOWNLOAD_TIMEOUT` | `3600` | Download timeout in seconds |
| `RATE_LIMIT_PER_IP` | `10` | Downloads per IP per hour |
| `LOG_LEVEL` | `INFO` | Logging level |
| `LOG_FILE` | `ytdler.log` | Log file name |
| `PROXY_URL` | `None` | Optional proxy URL |

## Project Structure

```
ytdler/
├── backend/
│   ├── app.py                 # Main application entry point
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py          # API endpoints
│   │   └── models.py          # Request/response models
│   └── core/
│       ├── __init__.py
│       ├── downloader.py      # yt-dlp wrapper
│       ├── queue.py           # Download queue manager
│       └── utils.py           # Helper functions
├── downloads/                 # Downloaded files directory
├── logs/                      # Application logs
├── .gitignore
├── README.md
└── LICENSE
```

## Error Handling

The API provides detailed error messages for common issues:

- **400 Bad Request**: Invalid URL or parameters
- **404 Not Found**: Download ID not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors

Example error response:
```json
{
  "error": "Invalid YouTube URL",
  "detail": "The provided URL is not a valid YouTube video URL"
}
```

## Troubleshooting

### Issue: "yt-dlp not found"
**Solution**: Ensure yt-dlp is installed: `pip install yt-dlp`

### Issue: "ffmpeg not found" when extracting audio
**Solution**: Install ffmpeg for your operating system (see Installation section)

### Issue: Downloads failing with "Unable to extract video data"
**Solution**: Update yt-dlp to the latest version:
```bash
pip install --upgrade yt-dlp
```

### Issue: "Rate limit exceeded"
**Solution**: Wait before making more requests or increase `RATE_LIMIT_PER_IP` in settings

### Issue: Video unavailable or private
**Solution**: Ensure the video is public and accessible. Age-restricted and private videos may require authentication.

## Updating yt-dlp

YouTube frequently changes its API. Keep yt-dlp updated:

```bash
pip install --upgrade yt-dlp
```

Consider automating updates or checking for updates regularly.

## Security Considerations

- ✅ **Input Validation**: All URLs are validated and sanitized
- ✅ **Rate Limiting**: IP-based rate limiting prevents abuse
- ✅ **File Size Limits**: Configurable maximum file size
- ✅ **Directory Traversal Prevention**: Filenames are sanitized
- ✅ **Error Handling**: Sensitive information not exposed in errors

**Production Recommendations:**
- Use HTTPS with proper SSL certificates
- Configure CORS appropriately (don't use `allow_origins=["*"]`)
- Set up proper authentication if needed
- Use a reverse proxy (nginx, Apache)
- Monitor logs for suspicious activity
- Set appropriate file size and rate limits

## Legal Considerations

⚠️ **IMPORTANT DISCLAIMER**

This tool is provided for **personal and educational use only**. Users must:

1. **Respect YouTube's Terms of Service**: Downloading videos may violate YouTube's ToS
2. **Respect Copyright**: Only download content you have rights to or that is in the public domain
3. **Fair Use**: Understand fair use laws in your jurisdiction
4. **No Warranty**: This software is provided "as is" without warranty of any kind

**The developers of this software:**
- Do not encourage or condone copyright infringement
- Are not responsible for how users utilize this tool
- Recommend using YouTube Premium for offline viewing

**Use this tool responsibly and legally.**

## Future Enhancements

Planned features for future releases:

- [ ] Playlist download support
- [ ] Batch download capabilities
- [ ] Download history tracking
- [ ] User authentication system
- [ ] React-based web UI
- [ ] Subtitle download support
- [ ] Video thumbnail extraction
- [ ] Schedule downloads
- [ ] Download resume capability

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## Acknowledgments

- **yt-dlp**: The powerful YouTube downloader library
- **FastAPI**: Modern Python web framework
- **uvicorn**: Lightning-fast ASGI server

---

**Made with ❤️ for the community**