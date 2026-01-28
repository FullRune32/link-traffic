// Mock traffic data generator
// Designed for easy swap with real API calls later

interface TrafficData {
  reach: string;
  uniqueVisitors: string;
  pageViews: string;
  shareRate: string;
}

// Domain authority heuristics for more realistic mock data
const domainTiers: Record<string, number> = {
  'google.com': 10,
  'youtube.com': 10,
  'facebook.com': 10,
  'amazon.com': 10,
  'twitter.com': 9,
  'instagram.com': 9,
  'linkedin.com': 9,
  'reddit.com': 8,
  'github.com': 8,
  'medium.com': 7,
  'nytimes.com': 8,
  'bbc.com': 8,
  'cnn.com': 8,
  'theguardian.com': 7,
  'forbes.com': 7,
  'techcrunch.com': 6,
};

function getDomainTier(url: string): number {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');

    // Check for exact match
    if (domainTiers[hostname]) {
      return domainTiers[hostname];
    }

    // Check for partial match (subdomains)
    for (const [domain, tier] of Object.entries(domainTiers)) {
      if (hostname.endsWith(domain)) {
        return tier;
      }
    }

    // Default tier based on TLD
    if (hostname.endsWith('.gov') || hostname.endsWith('.edu')) {
      return 6;
    }
    if (hostname.endsWith('.org')) {
      return 4;
    }

    // Random tier for unknown domains
    return Math.floor(Math.random() * 4) + 2; // 2-5
  } catch {
    return 3;
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `~${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `~${Math.round(num / 1000)}K`;
  }
  return `~${num}`;
}

function generateWithVariance(base: number, variance: number): number {
  const multiplier = 1 + (Math.random() - 0.5) * variance;
  return Math.round(base * multiplier);
}

export function generateMockTrafficData(url: string): TrafficData {
  const tier = getDomainTier(url);

  // Base values scale exponentially with tier
  const baseMultiplier = Math.pow(10, tier - 1);

  // Reach: estimated audience size
  const reachBase = 1000 * baseMultiplier;
  const reach = generateWithVariance(reachBase, 0.5);

  // Unique visitors: typically 10-30% of reach
  const visitorRatio = 0.1 + Math.random() * 0.2;
  const uniqueVisitors = Math.round(reach * visitorRatio);

  // Page views: typically 2-5x unique visitors
  const pageViewMultiplier = 2 + Math.random() * 3;
  const pageViews = Math.round(uniqueVisitors * pageViewMultiplier);

  // Share rate: 1-15%, higher for engaging content
  const shareRate = Math.round((1 + Math.random() * 14) * 10) / 10;

  return {
    reach: formatNumber(reach),
    uniqueVisitors: `${formatNumber(uniqueVisitors)}/month`,
    pageViews: `${formatNumber(pageViews)}/month`,
    shareRate: `${shareRate}%`,
  };
}
