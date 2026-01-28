'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';

interface ResultsCardProps {
  result: AnalysisResult;
}

function getSentimentColor(label: string): string {
  switch (label) {
    case 'Positive':
      return 'text-green-600 bg-green-50';
    case 'Negative':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

function formatRank(rank: number): string {
  return `#${rank.toLocaleString()}`;
}

export default function ResultsCard({ result }: ResultsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const sentimentColorClass = getSentimentColor(result.sentiment.label);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-2">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#2a2a2a] hover:underline break-all"
            title={result.url}
          >
            {truncateUrl(result.url, 60)}
          </a>
          {result.dataSource && (
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
              result.dataSource === 'cloudflare'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {result.dataSource === 'cloudflare' ? 'Cloudflare Radar' : 'Estimated'}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Analyzed at {new Date(result.analyzedAt).toLocaleString()}
        </p>
      </div>

      {result.error ? (
        <div className="text-red-500 text-sm py-2">
          Error: {result.error}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Screenshot */}
          {result.screenshotUrl && !imageError && (
            <div className="flex-shrink-0">
              <div className="relative w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400 text-xs">Loading...</div>
                  </div>
                )}
                <img
                  src={result.screenshotUrl}
                  alt={`Screenshot of ${result.url}`}
                  className={`w-full h-full object-cover object-top transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">Preview</p>
            </div>
          )}

          {/* Metrics */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {(result.rank || result.bucket) && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Global Rank</p>
                <p className="text-lg font-semibold text-[#2a2a2a]">
                  {result.rank ? formatRank(result.rank) : result.bucket}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Reach <span className="normal-case text-gray-400">(est.)</span></p>
              <p className="text-lg font-semibold text-[#2a2a2a]">{result.reach}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Unique Visitors <span className="normal-case text-gray-400">(est.)</span></p>
              <p className="text-lg font-semibold text-[#2a2a2a]">{result.uniqueVisitors}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Page Views <span className="normal-case text-gray-400">(est.)</span></p>
              <p className="text-lg font-semibold text-[#2a2a2a]">{result.pageViews}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Share Rate <span className="normal-case text-gray-400">(est.)</span></p>
              <p className="text-lg font-semibold text-[#2a2a2a]">{result.shareRate}</p>
            </div>

            <div className="space-y-1 col-span-2 md:col-span-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Sentiment</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${sentimentColorClass}`}>
                  {result.sentiment.label}
                </span>
                <span className="text-xs text-gray-500">
                  ({result.sentiment.score})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
