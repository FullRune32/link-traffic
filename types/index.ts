export interface SentimentResult {
  score: number;
  label: 'Positive' | 'Neutral' | 'Negative';
  comparative: number;
}

export interface AnalysisResult {
  url: string;
  reach: string;
  uniqueVisitors: string;
  pageViews: string;
  shareRate: string;
  sentiment: SentimentResult;
  analyzedAt: string;
  rank?: number;
  bucket?: string;
  dataSource?: 'cloudflare' | 'estimated';
  screenshotUrl?: string;
  error?: string;
}

export interface AnalyzeRequest {
  urls: string[];
}

export interface AnalyzeResponse {
  results: AnalysisResult[];
}
