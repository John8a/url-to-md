'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fileService } from '@/lib/services/file';
import { wordCopyService } from '@/lib/services/word-copy';
import { Copy, Download, Eye, Edit3, Check } from 'lucide-react';
import { SUCCESS_MESSAGES } from '@/lib/constants';

interface MarkdownEditorProps {
  initialMarkdown: string;
  metadata?: {
    title?: string;
    byline?: string;
    siteName?: string;
    excerpt?: string;
    length?: number;
    url?: string;
  };
}

export function MarkdownEditor({ initialMarkdown, metadata }: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isCopying, setIsCopying] = useState(false);
  const [isCopyingWord, setIsCopyingWord] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [wordCopySuccess, setWordCopySuccess] = useState(false);

  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await fileService.copyToClipboard(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.log('Failed to copy to clipboard');
    } finally {
      setIsCopying(false);
    }
  };

  const handleWordCopy = async () => {
    setIsCopyingWord(true);
    try {
      await wordCopyService.copyToWord(markdown, metadata);
      setWordCopySuccess(true);
      setTimeout(() => setWordCopySuccess(false), 2000);
    } catch {
      console.log('Failed to copy for Word');
    } finally {
      setIsCopyingWord(false);
    }
  };

  const handleDownload = () => {
    try {
      const filename = fileService.generateFilename(metadata?.title, metadata?.siteName);
      fileService.downloadMarkdown(markdown, filename);
      console.log(SUCCESS_MESSAGES.DOWNLOADED);
    } catch {
      console.log('Failed to download file');
    }
  };

  const handleWordDownload = () => {
    try {
      const filename = fileService.generateFilename(metadata?.title, metadata?.siteName);
      wordCopyService.downloadAsWordDocument(markdown, filename, metadata);
    } catch {
      console.log('Failed to download Word document');
    }
  };

  const renderPreview = () => {
    try {
      return { __html: marked(markdown) };
    } catch {
      return { __html: '<p class="text-destructive">Error rendering markdown preview</p>' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit">
      {/* Editor Panel */}
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Markdown Editor
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="link"
                size="sm"
                onClick={handleCopy}
                disabled={isCopying}
                className='text-muted-foreground hover:text-foreground'
              >
                {copySuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleDownload}
                className='text-muted-foreground hover:text-foreground !no-underline'
              >
                <Download className="h-4 w-4" />
                .md
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="h-full resize-none border-0 focus-visible:ring-0 font-mono text-sm rounded-none"
            placeholder="Your converted markdown will appear here..."
          />
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="link"
                size="sm"
                onClick={handleWordCopy}
                disabled={isCopyingWord}
                className='text-muted-foreground hover:text-foreground'
              >
                {wordCopySuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleWordDownload}
                className='text-muted-foreground hover:text-foreground !no-underline'
              >
                <Download className="h-4 w-4" />
                .docx
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto">
          <div
            className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-green-800 prose-a:text-green-600 prose-strong:text-green-900 prose-code:bg-green-50 prose-code:text-green-800 prose-pre:bg-green-50 prose-blockquote:border-green-500"
            dangerouslySetInnerHTML={renderPreview()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default MarkdownEditor;