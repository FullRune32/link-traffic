import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExportRequest } from '@/types';

async function fetchScreenshotAsBase64(screenshotUrl: string, baseUrl: string): Promise<string | null> {
  try {
    const fullUrl = screenshotUrl.startsWith('http') ? screenshotUrl : `${baseUrl}${screenshotUrl}`;
    const response = await fetch(fullUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

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

    // Get base URL for fetching screenshots
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(42, 42, 42);
    doc.text('Link Traffic Analysis Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

    let yPosition = 40;

    for (const result of results) {
      // Check if we need a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      // URL Header
      doc.setFontSize(11);
      doc.setTextColor(42, 42, 42);
      const displayUrl = result.url.length > 70 ? result.url.substring(0, 67) + '...' : result.url;
      doc.text(displayUrl, 14, yPosition);
      yPosition += 6;

      // Data source badge
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Data Source: ${result.dataSource === 'cloudflare' ? 'Cloudflare Radar' : 'Estimated'}`, 14, yPosition);
      yPosition += 6;

      if (result.error) {
        // Error state
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(10);
        doc.text(`Error: ${result.error}`, 14, yPosition);
        yPosition += 15;
      } else {
        // Metrics table
        const tableData = [
          ['Global Rank', result.rank ? `#${result.rank.toLocaleString()}` : result.bucket || 'N/A'],
          ['Reach', result.reach],
          ['Unique Visitors', result.uniqueVisitors],
          ['Page Views', result.pageViews],
          ['Share Rate', result.shareRate],
          ['Sentiment', `${result.sentiment.label} (score: ${result.sentiment.score})`],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [42, 42, 42],
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 9,
          },
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
        });

        // Get the final Y position after the table
        yPosition = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

        // Screenshot if available
        if (result.screenshotUrl) {
          const screenshotBase64 = await fetchScreenshotAsBase64(result.screenshotUrl, baseUrl);
          if (screenshotBase64) {
            // Check if we need a new page for the screenshot
            if (yPosition > 200) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Preview:', 14, yPosition);
            yPosition += 3;

            // Add screenshot with fixed width, proportional height (16:9 aspect ratio)
            const imgWidth = 120;
            const imgHeight = 67.5;
            doc.addImage(screenshotBase64, 'PNG', 14, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;
          }
        }

        // Analysis timestamp
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Analyzed: ${new Date(result.analyzedAt).toLocaleString()}`, 14, yPosition);
        yPosition += 15;
      }
    }

    // Footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="link-traffic-report-${timestamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
