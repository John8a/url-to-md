export const CONVERSION_CONSTANTS = {
  USER_AGENT: 'Mozilla/5.0 (compatible; URL-to-Markdown-Converter/1.0)',
  TIMEOUT: 30000, // 30 seconds
  MAX_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_PROTOCOLS: ['http:', 'https:'] as const,
} as const;

export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid URL',
  FETCH_FAILED: 'Failed to fetch the webpage',
  PARSE_FAILED: 'Could not extract readable content from the page',
  TIMEOUT: 'Request timed out',
  TOO_LARGE: 'Content is too large to process',
  UNKNOWN: 'An unexpected error occurred',
} as const;

export const SUCCESS_MESSAGES = {
  COPIED: 'Markdown copied to clipboard!',
  DOWNLOADED: 'Markdown file downloaded successfully!',
} as const;