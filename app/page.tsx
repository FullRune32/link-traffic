'use client';

import { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import AnalyzeButton from '@/components/AnalyzeButton';
import ResultsCard from '@/components/ResultsCard';
import { AnalysisResult, AnalyzeResponse } from '@/types';

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseUrls = (input: string): string[] => {
    return input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const validateUrls = (urls: string[]): { valid: string[]; invalid: string[] } => {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const url of urls) {
      try {
        new URL(url);
        valid.push(url);
      } catch {
        invalid.push(url);
      }
    }

    return { valid, invalid };
  };

  const handleAnalyze = async () => {
    const urls = parseUrls(urlInput);

    if (urls.length === 0) {
      setError('Please enter at least one URL');
      return;
    }

    const { valid, invalid } = validateUrls(urls);

    if (valid.length === 0) {
      setError('No valid URLs found. URLs must include http:// or https://');
      return;
    }

    if (invalid.length > 0) {
      setError(`Some URLs are invalid: ${invalid.join(', ')}`);
    } else {
      setError(null);
    }

    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: valid }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: AnalyzeResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setResults([]);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#2a2a2a] mb-3">
            Link Traffic
          </h1>
          <p className="text-gray-500">
            Analyze reach, engagement and sentiment of any link
          </p>
        </div>

        <div className="space-y-6">
          <UrlInput
            value={urlInput}
            onChange={setUrlInput}
            disabled={loading}
          />

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={urlInput.trim().length === 0}
              loading={loading}
            />
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-3 bg-white text-[#2a2a2a] font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-serif text-2xl font-medium text-[#2a2a2a]">
            Results
          </h2>
          {results.map((result, index) => (
            <ResultsCard key={`${result.url}-${index}`} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
