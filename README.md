# ytdler

Minimal YouTube downloader powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

Download a single video into a `downloads` directory (created if missing):

```bash
python ytdler.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

Choose a different directory or filename template:

```bash
python ytdler.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  --output ~/Videos --template "%(title)s-%(id)s.%(ext)s"
```

`--format` lets you pass any yt-dlp format selector (defaults to `bestvideo+bestaudio/best`). Use `--merge-format` to pick the output container (defaults to `mp4`).
