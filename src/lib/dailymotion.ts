// Dailymotion video URL parser and embed utilities

export interface DailymotionVideo {
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

/**
 * Extract video ID from various Dailymotion URL formats
 * Supports:
 * - https://www.dailymotion.com/video/x8qr2ml
 * - https://dailymotion.com/video/x8qr2ml
 * - https://dai.ly/x8qr2ml
 * - x8qr2ml (just the ID)
 */
export function extractVideoId(input: string): string | null {
  if (!input) return null;
  
  const trimmed = input.trim();
  
  // Already a video ID (alphanumeric, typically starts with 'x')
  if (/^[a-zA-Z0-9]+$/.test(trimmed) && trimmed.length >= 6 && trimmed.length <= 10) {
    return trimmed;
  }
  
  // Try various URL patterns
  const patterns = [
    // Standard dailymotion.com/video/ID format
    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/i,
    // Short dai.ly/ID format
    /dai\.ly\/([a-zA-Z0-9]+)/i,
    // Embed URL format
    /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate embed URL for a video ID
 */
export function getEmbedUrl(videoId: string): string {
  return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=0&quality=auto&ui-logo=0&ui-start-screen-info=0`;
}

/**
 * Generate thumbnail URL for a video ID
 */
export function getThumbnailUrl(videoId: string): string {
  return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
}

/**
 * Parse a Dailymotion URL and return video info
 */
export function parseVideoUrl(input: string): DailymotionVideo | null {
  const videoId = extractVideoId(input);
  if (!videoId) return null;
  
  return {
    videoId,
    embedUrl: getEmbedUrl(videoId),
    thumbnailUrl: getThumbnailUrl(videoId),
  };
}

/**
 * Validate if input is a valid Dailymotion URL or ID
 */
export function isValidDailymotionInput(input: string): boolean {
  return extractVideoId(input) !== null;
}
