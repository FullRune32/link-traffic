// Cloudflare URL Scanner API integration for screenshots

const ACCOUNT_ID = '01ae59f233741a8a28c2127964b9cfe4';

interface ScanResponse {
  success: boolean;
  result?: {
    uuid: string;
    url: string;
    visibility: string;
  };
  errors?: Array<{ message: string }>;
}

interface ScanSearchResponse {
  success: boolean;
  result?: {
    tasks?: Array<{
      uuid: string;
      time: string;
      status: string;
    }>;
  };
}

interface ScanStatusResponse {
  success: boolean;
  result?: {
    scan: {
      task: {
        status: string;
        success: boolean;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

// Search for existing completed scans for this URL
async function findExistingScan(url: string, apiToken: string): Promise<string | null> {
  try {
    // Search for recent scans of this URL
    const searchUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/urlscanner/scan?page_url=${encodeURIComponent(url)}&limit=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data: ScanSearchResponse = await response.json();

    // Check if we have a completed scan from the last 24 hours
    if (data.success && data.result?.tasks && data.result.tasks.length > 0) {
      const task = data.result.tasks[0];
      const scanTime = new Date(task.time).getTime();
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Use existing scan if it's less than 24 hours old
      if (now - scanTime < oneDayMs) {
        return task.uuid;
      }
    }
    return null;
  } catch (error) {
    console.log('Error searching for existing scan:', error);
    return null;
  }
}

// Create a new scan
async function createScan(url: string, apiToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/urlscanner/scan`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          screenshotsResolutions: ['desktop'],
        }),
      }
    );

    const data: ScanResponse = await response.json();

    if (data.success && data.result?.uuid) {
      return data.result.uuid;
    }

    // Check for specific errors
    if (data.errors?.some(e => e.message.includes('Unsupported hostname'))) {
      console.log(`URL Scanner: ${url} is not supported for scanning`);
    } else if (data.errors) {
      console.log(`URL Scanner error for ${url}:`, data.errors);
    }

    return null;
  } catch (error) {
    console.error('Error creating scan:', error);
    return null;
  }
}

// Wait for scan to complete
async function waitForScan(uuid: string, apiToken: string, maxWaitMs: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 2000;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/urlscanner/scan/${uuid}`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        await new Promise(r => setTimeout(r, pollInterval));
        continue;
      }

      const data: ScanStatusResponse = await response.json();
      const status = data.result?.scan?.task?.status;

      if (status === 'Finished') {
        return data.result?.scan?.task?.success ?? false;
      }

      if (status === 'Failed') {
        return false;
      }

      await new Promise(r => setTimeout(r, pollInterval));
    } catch {
      await new Promise(r => setTimeout(r, pollInterval));
    }
  }

  // Timeout - return true anyway as scan might still complete
  // The screenshot endpoint will fail gracefully if not ready
  return true;
}

export interface ScanResult {
  uuid: string;
  screenshotUrl: string;
}

export async function scanUrl(url: string): Promise<ScanResult | null> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    return null;
  }

  try {
    // First, check for existing recent scan
    let uuid = await findExistingScan(url, apiToken);

    if (uuid) {
      // Found existing scan, use it
      return {
        uuid,
        screenshotUrl: `/api/screenshot/${uuid}`,
      };
    }

    // No existing scan, create a new one
    uuid = await createScan(url, apiToken);

    if (!uuid) {
      return null;
    }

    // Wait for scan to complete
    await waitForScan(uuid, apiToken);

    // Return the screenshot URL (will be fetched via our proxy endpoint)
    return {
      uuid,
      screenshotUrl: `/api/screenshot/${uuid}`,
    };
  } catch (error) {
    console.error('Error scanning URL:', error);
    return null;
  }
}

export async function getScreenshot(uuid: string): Promise<Buffer | null> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/urlscanner/scan/${uuid}/screenshot?resolution=desktop`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      console.log(`Screenshot fetch failed for ${uuid}: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching screenshot:', error);
    return null;
  }
}
