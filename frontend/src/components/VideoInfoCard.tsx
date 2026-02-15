import React, { useState } from 'react';
import { VideoInfo } from '../types/video.types';

interface VideoInfoCardProps {
  videoInfo: VideoInfo;
  onDownload: (formatId?: string) => void;
  downloading: boolean;
  formatDuration: (seconds: number) => string;
}

const VideoInfoCard: React.FC<VideoInfoCardProps> = ({
  videoInfo,
  onDownload,
  downloading,
  formatDuration,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const handleDownload = () => {
    onDownload(selectedFormat || undefined);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb > 1000) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  // Group formats by quality
  const videoFormats = videoInfo.formats.filter(
    (f) => f.vcodec && f.vcodec !== 'none'
  );
  const audioFormats = videoInfo.formats.filter(
    (f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
  );

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-48 w-full object-cover md:w-72"
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
          />
        </div>
        <div className="p-8 w-full">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {videoInfo.author}
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {videoInfo.title}
          </h2>
          <div className="mt-4 space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Duration:</span>{' '}
              {formatDuration(videoInfo.duration)}
            </p>
            {videoInfo.viewCount && (
              <p>
                <span className="font-semibold">Views:</span>{' '}
                {videoInfo.viewCount.toLocaleString()}
              </p>
            )}
            {videoInfo.uploadDate && (
              <p>
                <span className="font-semibold">Upload Date:</span>{' '}
                {videoInfo.uploadDate}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-8 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Format
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
              Choose quality
            </label>
            <select
              id="format"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={downloading}
            >
              <option value="">Best Available (Auto)</option>
              
              {videoFormats.length > 0 && (
                <optgroup label="Video Formats">
                  {videoFormats
                    .sort((a, b) => {
                      const resA = parseInt(a.resolution) || 0;
                      const resB = parseInt(b.resolution) || 0;
                      return resB - resA;
                    })
                    .slice(0, 10)
                    .map((format) => (
                      <option key={format.formatId} value={format.formatId}>
                        {format.resolution} - {format.ext.toUpperCase()}
                        {format.formatNote ? ` (${format.formatNote})` : ''}
                        {format.filesize ? ` - ${formatFileSize(format.filesize)}` : ''}
                      </option>
                    ))}
                </optgroup>
              )}

              {audioFormats.length > 0 && (
                <optgroup label="Audio Only">
                  {audioFormats.slice(0, 5).map((format) => (
                    <option key={format.formatId} value={format.formatId}>
                      {format.ext.toUpperCase()} Audio
                      {format.formatNote ? ` (${format.formatNote})` : ''}
                      {format.filesize ? ` - ${formatFileSize(format.filesize)}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </span>
            ) : (
              '⬇️ Download Video'
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Choose "Best Available" for automatic quality selection
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoInfoCard;
