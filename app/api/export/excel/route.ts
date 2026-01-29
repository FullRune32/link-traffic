import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { ExportRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: ExportRequest = await request.json();
    const { results } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'No results to export' },
        { status: 400 }
      );
    }

    // Define headers
    const headers = [
      'URL',
      'Global Rank',
      'Reach',
      'Unique Visitors',
      'Page Views',
      'Share Rate',
      'Sentiment',
      'Sentiment Score',
      'Data Source',
      'Analyzed At',
      'Error',
    ];

    // Map results to rows
    const rows = results.map((result) => [
      result.url,
      result.rank ? `#${result.rank.toLocaleString()}` : result.bucket || 'N/A',
      result.reach,
      result.uniqueVisitors,
      result.pageViews,
      result.shareRate,
      result.sentiment.label,
      result.sentiment.score,
      result.dataSource === 'cloudflare' ? 'Cloudflare Radar' : 'Estimated',
      new Date(result.analyzedAt).toLocaleString(),
      result.error || '',
    ]);

    // Create worksheet from array of arrays
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 50 },  // URL
      { wch: 14 },  // Rank
      { wch: 14 },  // Reach
      { wch: 18 },  // Unique Visitors
      { wch: 16 },  // Page Views
      { wch: 12 },  // Share Rate
      { wch: 12 },  // Sentiment
      { wch: 14 },  // Sentiment Score
      { wch: 16 },  // Data Source
      { wch: 22 },  // Analyzed At
      { wch: 30 },  // Error
    ];

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Results');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="link-traffic-data-${timestamp}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}
