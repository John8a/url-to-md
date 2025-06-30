'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/general/sidebar';
import MarkdownEditor from '@/components/general/markdown-editor';
import { useConversion } from '@/lib/hooks/use-conversion';
import { conversionRequestSchema } from '@/lib/validations/conversion';
import { CopilotUrlInput } from '@/components/forms/url-input';
import { ExternalLink, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Conversion {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
  result: {
    markdown: string;
    metadata: {
      title?: string;
      byline?: string;
      siteName?: string;
      excerpt?: string;
      length?: number;
      url?: string;
    };
  };
}

export default function HomePage() {
  const { isLoading, error, result, convertUrl, reset } = useConversion();
  const [url, setUrl] = useState('');
  const [recentConversions, setRecentConversions] = useState<Conversion[]>([]);
  const [currentConversion, setCurrentConversion] = useState<Conversion | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleUrlSubmit = async (urlValue: string) => {

    try {
      const request = conversionRequestSchema.parse({
        url: urlValue,
        options: {
          includeMetadata: true,
          headingStyle: 'atx',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced',
        },
      });

      const conversionResult = await convertUrl(request);

      // Create new conversion record
      const newConversion: Conversion = {
        id: Date.now().toString(),
        title: conversionResult.metadata.title || 'Untitled',
        url: conversionResult.metadata.url || urlValue, // Use URL from metadata, fallback to input
        timestamp: new Date(),
        result: conversionResult,
      };

      // Add to recent conversions
      setRecentConversions(prev => [newConversion, ...prev.slice(0, 9)]);
      setCurrentConversion(newConversion);
      setShowEditor(true);
      setUrl('');
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  const handleSelectConversion = useCallback((conversion: Conversion) => {
    setCurrentConversion(conversion);
    setShowEditor(true);
    reset();
  }, [reset]);

  const handleClearHistory = useCallback(() => {
    setRecentConversions([]);
    setCurrentConversion(null);
  }, []);

  const handleNewConversion = () => {
    setCurrentConversion(null);
    setShowEditor(false);
    reset();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url && !isLoading) {
      handleUrlSubmit(url);
    }
  };

  return (
    <div className="flex h-screen bg-primary p-2 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        handleNewConversion={handleNewConversion}
        recentConversions={recentConversions}
        onSelectConversion={handleSelectConversion}
        onClearHistory={handleClearHistory}
        currentConversion={currentConversion}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background rounded-xl shadow-md overflow-hidden">
        {!showEditor ? (
          /* Landing Page */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-2xl space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground font-[monoSpace] mb-16">
                  What URL should we convert today?
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <CopilotUrlInput
                    onSubmit={handleUrlSubmit}
                    isLoading={isLoading}
                    error={error}
                    value={url}
                    onChange={setUrl}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Editor View */
          <div className="flex-1 overflow-y-auto">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {currentConversion?.title || result?.metadata.title || 'Converted Content'}
                    </h1>
                    {(currentConversion?.result?.metadata?.url || result?.metadata.url) && (
                      <p className="text-muted-foreground text-sm">
                        {(() => {
                          try {
                            const url = currentConversion?.result?.metadata?.url || result?.metadata.url;
                            return url ? new URL(url).hostname : '';
                          } catch {
                            return currentConversion?.result?.metadata?.siteName || result?.metadata.siteName || 'Unknown source';
                          }
                        })()}
                        <a
                          href={currentConversion?.result?.metadata?.url || result?.metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          <ExternalLink className="inline h-4 w-4 text-muted-foreground" />
                        </a>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="link"
                    onClick={handleNewConversion}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    New Conversion
                  </Button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 p-4">
                {(result || currentConversion?.result) && (
                  <div className=''>
                    <MarkdownEditor
                      initialMarkdown={(result || currentConversion?.result)?.markdown ?? ''}
                      metadata={(result || currentConversion?.result)?.metadata}
                    />
                    <div className="fixed bottom-4 w-full left-0">
                      <CopilotUrlInput
                        onSubmit={handleUrlSubmit}
                        isLoading={isLoading}
                        error={error}
                        value={url}
                        onChange={setUrl}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>

                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}