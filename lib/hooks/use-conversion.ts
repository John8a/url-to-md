"use client";

import { useState, useCallback } from 'react';
import { ConversionState } from '@/types/conversion';
import { ConversionRequest } from '@/lib/validations/conversion';

export function useConversion() {
  const [state, setState] = useState<ConversionState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const convertUrl = useCallback(async (request: ConversionRequest) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        result: data,
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    convertUrl,
    reset,
  };
}