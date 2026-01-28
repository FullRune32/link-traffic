// Core analysis logic
// Now using Cloudflare Radar API for real traffic data

import { AnalysisResult } from '@/types';
import { getTrafficData } from './trafficData';
import { scrapePageContent } from './scraper';
import { analyzeSentiment } from './sentiment';
import { scanUrl } from './urlScanner';

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  try {
    // Run all operations in parallel for speed
    const [trafficData, scanResult, pageContent] = await Promise.all([
      getTrafficData(url),
      scanUrl(url).catch(() => null),
      scrapePageContent(url).catch(() => null),
    ]);

    // Analyze sentiment from page content
    let sentiment;
    if (pageContent) {
      sentiment = analyzeSentiment(pageContent);
    } else {
      sentiment = {
        score: 0,
        label: 'Neutral' as const,
        comparative: 0,
      };
    }

    return {
      url,
      reach: trafficData.reach,
      uniqueVisitors: trafficData.uniqueVisitors,
      pageViews: trafficData.pageViews,
      shareRate: trafficData.shareRate,
      rank: trafficData.rank,
      bucket: trafficData.bucket,
      dataSource: trafficData.source,
      screenshotUrl: scanResult?.screenshotUrl,
      sentiment,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      url,
      reach: 'N/A',
      uniqueVisitors: 'N/A',
      pageViews: 'N/A',
      shareRate: 'N/A',
      sentiment: {
        score: 0,
        label: 'Neutral',
        comparative: 0,
      },
      analyzedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

export async function analyzeUrls(urls: string[]): Promise<AnalysisResult[]> {
  const results = await Promise.all(urls.map(analyzeUrl));
  return results;
}
