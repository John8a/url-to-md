export class FileService {
  static generateFilename(title?: string, url?: string): string {
    if (title) {
      return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.md`;
    }
    
    if (url) {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        return `${domain}-${Date.now()}.md`;
      } catch {
        // fallback
      }
    }
    
    return `converted-${Date.now()}.md`;
  }

  static async copyToClipboard(text: string): Promise<void> {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textArea);
      }
      return;
    }

    await navigator.clipboard.writeText(text);
  }

  static downloadMarkdown(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

export const fileService = FileService;