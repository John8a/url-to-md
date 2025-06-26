'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { urlSchema, type UrlInput } from '@/lib/validations/conversion';
import { Loader2, Globe, ArrowRight } from 'lucide-react';

interface UrlInputFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function UrlInputForm({ onSubmit, isLoading, error }: UrlInputFormProps) {
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UrlInput>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  });

  const currentUrl = watch('url');

  const handleFormSubmit = async (data: UrlInput) => {
    await onSubmit(data.url);
    
    // Add to recent URLs
    setRecentUrls(prev => {
      const filtered = prev.filter(url => url !== data.url);
      return [data.url, ...filtered].slice(0, 5);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !errors.url && currentUrl) {
      handleSubmit(handleFormSubmit)();
    }
  };

  const handleRecentUrlClick = (url: string) => {
    setValue('url', url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          URL to Markdown Converter
        </CardTitle>
        <CardDescription className="text-lg">
          Convert any webpage to clean, formatted Markdown with live preview
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                {...register('url')}
                type="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                onKeyPress={handleKeyPress}
                className={`h-12 text-base ${errors.url ? 'border-destructive' : ''}`}
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
              className="h-12 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  Convert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recentUrls.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Recent URLs:</h3>
            <div className="flex flex-wrap gap-2">
              {recentUrls.map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecentUrlClick(url)}
                  className="text-xs"
                  disabled={isLoading}
                >
                  {new URL(url).hostname}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}