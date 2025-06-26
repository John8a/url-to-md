'use client';

import { useState } from 'react';
import { UrlInputForm } from '@/components/forms/url-input';
import MarkdownEditor from '@/components/general/markdown-editor';
import { useConversion } from '@/lib/hooks/use-conversion';
import { conversionRequestSchema } from '@/lib/validations/conversion';
import { ExternalLink, Plus, X, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { urlSchema, type UrlInput } from '@/lib/validations/conversion';

export default function HomePage() {
  const { isLoading, error, result, convertUrl, reset } = useConversion();
  const [showEditor, setShowEditor] = useState(false);
  const [showNewUrlInput, setShowNewUrlInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch,
  } = useForm<UrlInput>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  });

  const currentUrl = watch('url');

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

  const handleNewUrlSubmit = async (data: UrlInput) => {
    try {
      const request = conversionRequestSchema.parse({
        url: data.url,
        options: {
          includeMetadata: true,
          headingStyle: 'atx',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced',
        },
      });

      await convertUrl(request);
      setShowNewUrlInput(false);
      resetForm();
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  const handleNewConversion = () => {
    reset();
    setShowEditor(false);
    setShowNewUrlInput(false);
    resetForm();
  };

  const toggleNewUrlInput = () => {
    setShowNewUrlInput(!showNewUrlInput);
    if (!showNewUrlInput) {
      resetForm();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !errors.url && currentUrl) {
      handleSubmit(handleNewUrlSubmit)();
    }
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {result?.metadata.title || 'Converted Content'}
              </h1>
              {result?.metadata.url && (
                <a 
                  href={result.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                >
                  {new URL(result.metadata.url).hostname}
                  <ExternalLink className='h-4 w-4'/>
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!showNewUrlInput ? (
                <>
                  <Button
                    onClick={toggleNewUrlInput}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Convert Another URL
                  </Button>
                  <Button
                    onClick={handleNewConversion}
                    variant="ghost"
                    size="sm"
                  >
                    Start Over
                  </Button>
                </>
              ) : (
                <Button
                  onClick={toggleNewUrlInput}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Dynamic URL Input */}
          {showNewUrlInput && (
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Convert Another URL</h3>
              <form onSubmit={handleSubmit(handleNewUrlSubmit)} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      {...register('url')}
                      type="url"
                      placeholder="Enter website URL (e.g., https://example.com)"
                      onKeyPress={handleKeyPress}
                      className={`${errors.url ? 'border-destructive' : ''}`}
                      disabled={isLoading}
                    />
                    {errors.url && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.url.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || !!errors.url || !currentUrl}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        Convert
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    {error}
                  </div>
                )}
              </form>
            </div>
          )}

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