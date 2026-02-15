# Quick Start Guide

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nimtruly/ytdler.git
   cd ytdler
   ```

2. **Run the startup script:**
   ```bash
   ./start_server.sh
   ```
   
   The script will:
   - Create a virtual environment
   - Install all dependencies
   - Start the API server

3. **Access the API:**
   - API Server: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc

## Quick API Test

```bash
# Check server health
curl http://localhost:8000/health

# Get video information
curl -X POST http://localhost:8000/api/video/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'

# Check queue status
curl http://localhost:8000/api/queue/status
```

## Using the Example Client

```bash
# Basic test (no download)
python examples/client_example.py

# Test with a video URL
python examples/client_example.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

## Configuration

Create a `.env` file in the project root:

```env
# Server settings
HOST=0.0.0.0
PORT=8000

# Download settings
MAX_FILE_SIZE_MB=500
MAX_CONCURRENT_DOWNLOADS=3

# Rate limiting
RATE_LIMIT_PER_IP=10
```

## Manual Installation

If you prefer manual setup:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Set PYTHONPATH and run
export PYTHONPATH=$PWD
python backend/app.py
```

## Troubleshooting

**Issue: "Module not found" error**
```bash
# Ensure PYTHONPATH is set
export PYTHONPATH=/path/to/ytdler
```

**Issue: "yt-dlp not found"**
```bash
pip install --upgrade yt-dlp
```

**Issue: "ffmpeg not found" (for audio extraction)**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/video/info` | POST | Get video metadata |
| `/api/video/formats` | POST | List available formats |
| `/api/video/download` | POST | Start download |
| `/api/download/status/{id}` | GET | Check progress |
| `/api/queue/status` | GET | Queue information |
| `/api/download/{id}` | DELETE | Cancel download |

## Legal Notice

⚠️ This tool is for personal and educational use only. Always respect YouTube's Terms of Service and copyright laws.

For more information, see the full [README.md](README.md).
