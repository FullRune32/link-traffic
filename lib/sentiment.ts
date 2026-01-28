// Sentiment analysis wrapper using the 'sentiment' package

import Sentiment from 'sentiment';
import { SentimentResult } from '@/types';

const analyzer = new Sentiment();

export function analyzeSentiment(text: string): SentimentResult {
  const result = analyzer.analyze(text);

  // Determine label based on score thresholds
  let label: 'Positive' | 'Neutral' | 'Negative';
  if (result.score > 2) {
    label = 'Positive';
  } else if (result.score < -2) {
    label = 'Negative';
  } else {
    label = 'Neutral';
  }

  return {
    score: result.score,
    label,
    comparative: Math.round(result.comparative * 100) / 100,
  };
}
