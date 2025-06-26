import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { ConversionResult } from '@/types/conversion';
import { CONVERSION_CONSTANTS, ERROR_MESSAGES } from '@/lib/constants';
import { ConversionRequest } from '@/lib/validations/conversion';

export class ConversionService {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
    });

    this.setupTurndownRules();
  }

  private setupTurndownRules(): void {
    // Custom rule for strikethrough
    this.turndownService.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: (content: string) => `~~${content}~~`
    });

    // Custom rule for better link handling
    this.turndownService.addRule('links', {
      filter: 'a',
      replacement: (content: string, node: any) => {
        const href = node.getAttribute('href');
        if (!href || href === content) return content;
        return `[${content}](${href})`;
      }
    });

    // Custom rule for code blocks
    this.turndownService.addRule('codeBlock', {
      filter: 'pre',
      replacement: (content: string, node: any) => {
        const codeElement = node.querySelector('code');
        const language = codeElement?.getAttribute('class')?.match(/language-(\w+)/)?.[1] || '';
        return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
      }
    });
  }

  async fetchWebpage(url: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONVERSION_CONSTANTS.TIMEOUT);

      const response = await fetch(url, {
        headers: {
          'User-Agent': CONVERSION_CONSTANTS.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > CONVERSION_CONSTANTS.MAX_CONTENT_SIZE) {
        throw new Error(ERROR_MESSAGES.TOO_LARGE);
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(ERROR_MESSAGES.TIMEOUT);
        }
        throw new Error(`${ERROR_MESSAGES.FETCH_FAILED}: ${error.message}`);
      }
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }
  }

  extractContent(html: string, url: string): { content: string; metadata: any } {
    try {
      const dom = new JSDOM(html, { url });
      const document = dom.window.document;

      // Use Readability to extract main content
      const reader = new Readability(document, {
        debug: false,
        maxElemsToParse: 0,
        nbTopCandidates: 5,
        charThreshold: 500,
        classesToPreserve: ['highlight', 'code'],
      });

      const article = reader.parse();

      if (!article) {
        throw new Error(ERROR_MESSAGES.PARSE_FAILED);
      }

      return {
        content: article.content ?? '',
        metadata: {
          title: article.title,
          byline: article.byline,
          siteName: article.siteName,
          excerpt: article.excerpt,
          length: article.length,
        },
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.PARSE_FAILED);
    }
  }

  convertToMarkdown(html: string, options?: ConversionRequest['options']): string {
    if (options) {
      this.turndownService.options.headingStyle = options.headingStyle || 'atx';
      this.turndownService.options.bulletListMarker = options.bulletListMarker || '-';
      this.turndownService.options.codeBlockStyle = options.codeBlockStyle || 'fenced';
    }

    return this.turndownService.turndown(html);
  }

  formatFinalMarkdown(
    markdown: string,
    metadata: any,
    originalUrl: string,
    includeMetadata: boolean = true
  ): string {
    if (!includeMetadata) {
      return markdown.trim();
    }

    const parts: string[] = [];

    // Title
    if (metadata.title) {
      parts.push(`# ${metadata.title}`);
      parts.push('');
    }

    // Metadata section
    const metadataParts: string[] = [];
    if (metadata.byline) metadataParts.push(`**Author:** ${metadata.byline}`);
    if (metadata.siteName) metadataParts.push(`**Source:** ${metadata.siteName}`);
    metadataParts.push(`**Original URL:** ${originalUrl}`);
    if (metadata.length) metadataParts.push(`**Reading time:** ~${Math.ceil(metadata.length / 400)} min`);

    if (metadataParts.length > 0) {
      parts.push(metadataParts.join('  \n'));
      parts.push('');
      parts.push('---');
      parts.push('');
    }

    // Excerpt
    if (metadata.excerpt) {
      parts.push(`> ${metadata.excerpt}`);
      parts.push('');
    }

    // Main content
    parts.push(markdown.trim());

    return parts.join('\n');
  }

  async convertUrl(request: ConversionRequest): Promise<ConversionResult> {
    try {
      // Validate URL
      new URL(request.url);

      // Fetch webpage
      const html = await this.fetchWebpage(request.url);

      // Extract content
      const { content, metadata } = this.extractContent(html, request.url);

      // Convert to markdown
      const rawMarkdown = this.convertToMarkdown(content, request.options);

      // Format final markdown
      const finalMarkdown = this.formatFinalMarkdown(
        rawMarkdown,
        metadata,
        request.url,
        request.options?.includeMetadata !== false
      );

      return {
        markdown: finalMarkdown,
        metadata,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }
}

// Create singleton instance
export const conversionService = new ConversionService();