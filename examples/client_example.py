#!/usr/bin/env python3
"""
Example client script demonstrating YouTube Downloader API usage.
"""
import sys
import time
import requests
import json


API_BASE_URL = "http://localhost:8000"


def print_response(response):
    """Pretty print API response."""
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except Exception:
        print(response.text)


def test_health():
    """Test health endpoint."""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{API_BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print_response(response)


def test_video_info(url):
    """Test video info extraction."""
    print("\n=== Testing Video Info Endpoint ===")
    response = requests.post(
        f"{API_BASE_URL}/api/video/info",
        json={"url": url}
    )
    print(f"Status Code: {response.status_code}")
    print_response(response)
    return response


def test_video_formats(url):
    """Test available formats endpoint."""
    print("\n=== Testing Video Formats Endpoint ===")
    response = requests.post(
        f"{API_BASE_URL}/api/video/formats",
        json={"url": url}
    )
    print(f"Status Code: {response.status_code}")
    print_response(response)
    return response


def test_download(url, audio_only=False):
    """Test video download."""
    print(f"\n=== Testing Download Endpoint (audio_only={audio_only}) ===")
    response = requests.post(
        f"{API_BASE_URL}/api/video/download",
        json={"url": url, "audio_only": audio_only}
    )
    print(f"Status Code: {response.status_code}")
    print_response(response)
    
    if response.status_code == 200:
        data = response.json()
        download_id = data.get('download_id')
        if download_id:
            # Monitor download progress
            print(f"\nMonitoring download progress for ID: {download_id}")
            monitor_download(download_id)
    
    return response


def monitor_download(download_id, max_checks=30):
    """Monitor download progress."""
    for i in range(max_checks):
        time.sleep(2)
        response = requests.get(
            f"{API_BASE_URL}/api/download/status/{download_id}"
        )
        
        if response.status_code == 200:
            data = response.json()
            status = data.get('status')
            progress = data.get('progress', 0)
            
            print(f"Status: {status}, Progress: {progress}%")
            
            if status in ['completed', 'failed', 'cancelled']:
                print("\nFinal Status:")
                print_response(response)
                break
        else:
            print(f"Error checking status: {response.status_code}")
            break


def test_queue_status():
    """Test queue status endpoint."""
    print("\n=== Testing Queue Status Endpoint ===")
    response = requests.get(f"{API_BASE_URL}/api/queue/status")
    print(f"Status Code: {response.status_code}")
    print_response(response)


def main():
    """Main function."""
    print("YouTube Downloader API Client Example")
    print("=" * 50)
    
    # Test health
    test_health()
    
    # Test queue status
    test_queue_status()
    
    # If URL provided, test with it
    if len(sys.argv) > 1:
        video_url = sys.argv[1]
        print(f"\nUsing video URL: {video_url}")
        
        # Test video info
        test_video_info(video_url)
        
        # Test formats
        test_video_formats(video_url)
        
        # You can uncomment to test actual download
        # Warning: This will download the video
        # test_download(video_url)
        # test_download(video_url, audio_only=True)
    else:
        print("\n" + "=" * 50)
        print("To test with a specific video URL:")
        print("  python examples/client_example.py <YOUTUBE_URL>")
        print("\nExample:")
        print('  python examples/client_example.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"')
    
    print("\n" + "=" * 50)
    print("Tests completed!")


if __name__ == "__main__":
    main()
