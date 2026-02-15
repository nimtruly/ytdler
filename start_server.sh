#!/bin/bash
# Startup script for YouTube Downloader API

# Set script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing requirements..."
    pip install -r backend/requirements.txt
fi

# Set PYTHONPATH
export PYTHONPATH="$SCRIPT_DIR"

# Start the server
echo "Starting YouTube Downloader API..."
echo "API will be available at http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
python backend/app.py
