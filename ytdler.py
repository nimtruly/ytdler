#!/usr/bin/env python3
"""Minimal CLI to download a single YouTube video using yt-dlp."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download a YouTube video to the specified directory."
    )
    parser.add_argument("url", help="YouTube video URL to download")
    parser.add_argument(
        "-o",
        "--output",
        default="downloads",
        help="Directory to place the downloaded file (default: %(default)s)",
    )
    parser.add_argument(
        "-t",
        "--template",
        help=(
            "Custom output filename template using yt-dlp fields "
            "(e.g. %%(title)s.%%(ext)s)"
        ),
    )
    parser.add_argument(
        "-f",
        "--format",
        default="bestvideo+bestaudio/best",
        help="Format selector passed to yt-dlp (default: %(default)s)",
    )
    parser.add_argument(
        "--merge-format",
        default="mp4",
        help="Container to use when merging streams (default: %(default)s)",
    )
    return parser.parse_args()


def download_video(
    url: str,
    output_dir: Path,
    filename_template: str | None = None,
    format_selector: str = "bestvideo+bestaudio/best",
    merge_format: str = "mp4",
) -> bool:
    """Download a single YouTube video.

    Args:
        url: Video URL to download.
        output_dir: Destination directory; created if missing.
        filename_template: yt-dlp output template (default: ``%(title)s.%(ext)s``).
        format_selector: yt-dlp format selector string.
        merge_format: Container to use when merging audio/video streams.

    Returns:
        True when yt-dlp reports success, False otherwise.

    Raises:
        DownloadError: when yt-dlp cannot download the video.
        Exception: for unexpected errors raised by yt-dlp.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    template = filename_template or "%(title)s.%(ext)s"
    ydl_opts = {
        "format": format_selector,
        "outtmpl": str(output_dir / template),
        "noplaylist": True,
        "merge_output_format": merge_format,
    }

    with YoutubeDL(ydl_opts) as ydl:
        return ydl.download([url]) == 0


def main() -> int:
    args = parse_args()
    try:
        success = download_video(
            args.url,
            Path(args.output).expanduser().resolve(),
            args.template,
            args.format,
            args.merge_format,
        )
    except DownloadError as exc:
        print(f"yt-dlp error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1

    if success:
        print("Download completed successfully.")
        return 0

    print("Download failed.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
