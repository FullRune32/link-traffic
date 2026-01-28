# Link Traffic

A web application for analyzing link traffic metrics including reach, unique visitors, page views, share rate, and sentiment. Built with the Freuds design aesthetic.

## Features

- **Domain Ranking** - Real global ranking data from Cloudflare Radar (e.g., "Top 200", "Top 5000")
- **Traffic Estimates** - Visitor and page view estimates calculated from ranking position
- **Sentiment Analysis** - Analyzes actual page content to determine positive/neutral/negative tone
- **Page Screenshots** - Captures website previews via Cloudflare URL Scanner
- **Multi-URL Support** - Analyze multiple links at once

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **APIs**: Cloudflare Radar API, Cloudflare URL Scanner API
- **Sentiment**: `sentiment` npm package

## Getting Started

### Prerequisites

- Node.js 18+
- Cloudflare account with API token

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/FullRune32/link-traffic.git
   cd link-traffic
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Cloudflare API token:
   ```
   CLOUDFLARE_API_TOKEN=your_token_here
   ```

   Your token needs these permissions:
   - Account > Radar > Read
   - Account > URL Scanner > Edit

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter one or more URLs in the textarea (one per line)
2. Click "Analyze Links"
3. View results including:
   - Global rank (from Cloudflare Radar)
   - Estimated reach, visitors, and page views
   - Share rate estimate
   - Sentiment analysis of page content
   - Page screenshot preview

## Data Sources

| Metric | Source | Type |
|--------|--------|------|
| Global Rank | Cloudflare Radar | Real data |
| Reach | Calculated from rank | Estimate |
| Unique Visitors | Calculated from rank | Estimate |
| Page Views | Calculated from rank | Estimate |
| Share Rate | Calculated from rank | Estimate |
| Sentiment | Page content analysis | Real data |
| Screenshot | Cloudflare URL Scanner | Real data |

## Deployment

Deploy to Vercel or any Node.js hosting platform. Make sure to set the `CLOUDFLARE_API_TOKEN` environment variable.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/FullRune32/link-traffic)

## License

MIT
