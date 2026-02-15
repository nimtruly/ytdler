import React, { useState } from 'react';
import { VideoService } from '../services/video.service';
import { VideoInfo } from '../types/video.types';
import VideoInfoCard from './VideoInfoCard';

const VideoDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVideoInfo(null);
    setDownloadSuccess(null);

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!VideoService.validateUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);

    try {
      const info = await VideoService.getVideoInfo(url);
      setVideoInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatId?: string) => {
    if (!url) return;

    setDownloading(true);
    setError(null);
    setDownloadSuccess(null);

    try {
      const result = await VideoService.downloadVideo({ url, formatId });
      setDownloadSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download video');
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            YouTube Downloader
          </h1>
          <p className="text-xl text-gray-600">
            Download videos from YouTube quickly and easily
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <form onSubmit={handleFetchInfo} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {downloadSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {downloadSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching Video Info...
                </span>
              ) : (
                'Get Video Info'
              )}
            </button>
          </form>
        </div>

        {videoInfo && (
          <VideoInfoCard
            videoInfo={videoInfo}
            onDownload={handleDownload}
            downloading={downloading}
            formatDuration={formatDuration}
          />
        )}
      </div>
    </div>
  );
};

export default VideoDownloader;
