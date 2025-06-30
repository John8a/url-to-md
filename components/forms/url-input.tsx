'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, Globe, ArrowUp } from 'lucide-react';

interface CopilotUrlInputProps {
    onSubmit: (url: string) => Promise<void>;
    isLoading: boolean;
    error?: string | null;
    value: string;
    onChange: (value: string) => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function CopilotUrlInput({
    onSubmit,
    isLoading,
    error,
    value,
    onChange,
    onKeyPress
}: CopilotUrlInputProps) {
    const [urlError, setUrlError] = useState('');

    const validateUrl = (urlString: string) => {
        try {
            const parsedUrl = new URL(urlString);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                return 'URL must use HTTP or HTTPS protocol';
            }
            return '';
        } catch {
            return 'Please enter a valid URL';
        }
    };

    const handleSubmit = async () => {
        const errorMsg = validateUrl(value);
        if (errorMsg) {
            setUrlError(errorMsg);
            return;
        }

        setUrlError('');
        await onSubmit(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        if (urlError || error) {
            setUrlError('');
        }
    };

    const hasError = urlError || error;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="">
                <div className="w-full bg-gradient-to-r rounded-2xl from-emerald-50 to-teal-50 p-1.5 shadow-2xl focus:shadow-xl">
                    <div className="flex gap-3 items-center rounded-xl bg-gradient-to-b from-white to-emerald-50 px-3 py-2">
                        <Input
                            type="url"
                            placeholder="Enter website URL (e.g., https://example.com)"
                            value={value}
                            onChange={handleInputChange}
                            onKeyPress={onKeyPress}
                            className={`pl-2 h-12 text-base border-0 shadow-none transition-colors focus:ring-0 focus:border-0 focus-visible:ring-0 focus:outline-none !focus-visible:outline-none`}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !value || !!hasError}
                            variant="ghost"
                            className="h-12"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <ArrowUp className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {hasError && (
                <div className="mt-3 text-sm text-destructive animate-slide-in">
                    {urlError || error}
                </div>
            )}
        </div>
    );
}