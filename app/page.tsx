'use client';

import { useState } from 'react';
import { UrlInputForm } from '@/components/forms/url-input';
import MarkdownEditor from '@/components/general/markdown-editor';
import { useConversion } from '@/lib/hooks/use-conversion';
import { conversionRequestSchema } from '@/lib/validations/conversion';

export default function HomePage() {
  const { isLoading, error, result, convertUrl, reset } = useConversion();
  const [showEditor, setShowEditor] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    try {
      const request = conversionRequestSchema.parse({
        url,
        options: {
          includeMetadata: true,
          headingStyle: 'atx',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced',
        },
      });

      await convertUrl(request);
      setShowEditor(true);
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  const handleNewConversion = () => {
    reset();
    setShowEditor(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {!showEditor ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
          <UrlInputForm
            onSubmit={handleUrlSubmit}
            isLoading={isLoading}
            error={error}
          />
          
          <div className="text-center space-y-4 max-w-2xl">
            <h2 className="text-xl font-semibold text-muted-foreground">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto">
                  1
                </div>
                <p className="font-medium">Enter URL</p>
                <p className="text-muted-foreground">
                  Paste any webpage URL you want to convert
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto">
                  2
                </div>
                <p className="font-medium">Extract Content</p>
                <p className="text-muted-foreground">
                  Our tool extracts clean, readable content
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto">
                  3
                </div>
                <p className="font-medium">Get Markdown</p>
                <p className="text-muted-foreground">
                  Edit, copy, or download your markdown
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {result?.metadata.title || 'Converted Content'}
              </h1>
              {result?.metadata.siteName && (
                <p className="text-muted-foreground">
                  From {result.metadata.siteName}
                </p>
              )}
            </div>
            <button
              onClick={handleNewConversion}
              className="text-primary hover:underline"
            >
              Convert Another URL
            </button>
          </div>

          {result && (
            <MarkdownEditor
              initialMarkdown={result.markdown}
              metadata={result.metadata}
            />
          )}
        </div>
      )}
    </div>
  );
}
