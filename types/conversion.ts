export interface ConversionResult {
  markdown: string;
  metadata: {
    title?: string;
    byline?: string;
    siteName?: string;
    excerpt?: string;
    length?: number;
    url?: string;
  };
}

export interface ConversionError {
  error: string;
  code?: string;
}

export interface ConversionState {
  isLoading: boolean;
  error: string | null;
  result: ConversionResult | null;
}