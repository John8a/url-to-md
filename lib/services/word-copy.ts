export class WordCopyService {
  /**
   * Converts markdown to Word-optimized HTML with proper styling
   */
  static markdownToWordHtml(markdown: string): string {
    // Basic markdown to HTML conversion optimized for Word
    const html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3 style="color: #2F4F4F; font-size: 16px; font-weight: bold; margin: 12px 0 6px 0;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #2F4F4F; font-size: 18px; font-weight: bold; margin: 14px 0 8px 0;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #1F3A3A; font-size: 22px; font-weight: bold; margin: 16px 0 10px 0;">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<s style="text-decoration: line-through;">$1</s>')
      
      // Code blocks
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```(\w+)?\n?/, '').replace(/```$/, '');
        return `<div style="background-color: #f5f7fa; border: 1px solid #e1e8ed; border-radius: 4px; padding: 12px; margin: 12px 0; font-family: 'Courier New', monospace; font-size: 11px; white-space: pre-wrap;">${code}</div>`;
      })
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background-color: #f0f4f8; padding: 2px 4px; border-radius: 3px; font-family: \'Courier New\', monospace; font-size: 11px;">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2E7D32; text-decoration: underline;">$1</a>')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #4CAF50; margin: 12px 0; padding: 8px 16px; background-color: #f8fffe; font-style: italic; color: #2E7D32;">$1</blockquote>')
      
      // Unordered lists
      .replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
      .replace(/(<li.*<\/li>\s*)+/g, (match) => `<ul style="margin: 8px 0; padding-left: 20px;">${match}</ul>`)
      
      // Ordered lists  
      .replace(/^\d+\. (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
      .replace(/(<li.*<\/li>\s*)+/g, (match) => `<ul style="margin: 8px 0; padding-left: 20px;">${match}</ul>`)
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #4CAF50; margin: 20px 0;">')
      
      // Paragraphs (convert double line breaks to paragraphs)
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.trim() && 
            !paragraph.includes('<h1') && 
            !paragraph.includes('<h2') && 
            !paragraph.includes('<h3') &&
            !paragraph.includes('<ul') &&
            !paragraph.includes('<blockquote') &&
            !paragraph.includes('<div') &&
            !paragraph.includes('<hr')) {
          return `<p style="margin: 8px 0; line-height: 1.5; color: #333;">${paragraph.trim()}</p>`;
        }
        return paragraph;
      })
      .join('\n\n');

    return html;
  }

  /**
   * Creates Word-compatible clipboard data
   */
  static async copyToWord(markdown: string, metadata?: any): Promise<void> { // eslint-disable-line
    const html = this.markdownToWordHtml(markdown);
    
    // Create complete HTML document for Word
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="Generator" content="URL to Markdown Converter">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
        }
        .metadata {
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 12px;
            margin-bottom: 20px;
            font-size: 11px;
            color: #666;
        }
        .metadata h1 {
            color: #1F3A3A !important;
            font-size: 24px !important;
            margin-bottom: 8px !important;
        }
        .content {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    ${metadata ? `
    <div class="metadata">
        ${metadata.title ? `<h1>${metadata.title}</h1>` : ''}
        ${metadata.byline ? `<p><strong>Author:</strong> ${metadata.byline}</p>` : ''}
        ${metadata.siteName ? `<p><strong>Source:</strong> ${metadata.siteName}</p>` : ''}
        ${metadata.url ? `<p><strong>URL:</strong> <a href="${metadata.url}">${metadata.url}</a></p>` : ''}
        ${metadata.length ? `<p><strong>Reading time:</strong> ~${Math.ceil(metadata.length / 200)} min</p>` : ''}
        <p><strong>Converted:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    ` : ''}
    <div class="content">
        ${html}
    </div>
</body>
</html>`;

    // Try modern clipboard API with HTML
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const textBlob = new Blob([markdown], { type: 'text/plain' });
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob,
          }),
        ]);
        return;
      } catch {
        console.warn('Modern clipboard API failed, falling back to legacy method');
      }
    }

    // Fallback: copy as plain text
    await this.fallbackCopy(markdown);
  }

  /**
   * Fallback method for copying plain text
   */
  private static async fallbackCopy(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Final fallback for very old browsers
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
  }

  /**
   * Creates a Word document download
   */
  static downloadAsWordDocument(markdown: string, filename: string, metadata?: any): void { // eslint-disable-line
    const html = this.markdownToWordHtml(markdown);
    
    const wordDocument = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <meta name="Originator" content="Microsoft Word 15">
    <style>
        @page {
            size: 8.5in 11in;
            margin: 1in;
        }
        body {
            font-family: 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }
        .metadata {
            border-bottom: 2pt solid #4CAF50;
            padding-bottom: 12pt;
            margin-bottom: 20pt;
        }
        h1 { font-size: 18pt; color: #1F3A3A; }
        h2 { font-size: 14pt; color: #2F4F4F; }
        h3 { font-size: 12pt; color: #2F4F4F; }
        code { font-family: 'Courier New', monospace; }
        pre { font-family: 'Courier New', monospace; white-space: pre-wrap; }
    </style>
</head>
<body>
    ${metadata ? `
    <div class="metadata">
        ${metadata.title ? `<h1>${metadata.title}</h1>` : ''}
        ${metadata.byline ? `<p><strong>Author:</strong> ${metadata.byline}</p>` : ''}
        ${metadata.siteName ? `<p><strong>Source:</strong> ${metadata.siteName}</p>` : ''}
        ${metadata.url ? `<p><strong>URL:</strong> ${metadata.url}</p>` : ''}
        <p><strong>Converted:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    ` : ''}
    ${html}
</body>
</html>`;

    const blob = new Blob([wordDocument], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/\.md$/, '.docx');
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

export const wordCopyService = WordCopyService;