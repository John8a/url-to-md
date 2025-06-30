'use client';

import { Button } from '@/components/ui/button';
import { 
  Globe, 
  History, 
  Settings, 
  FileText, 
  Trash2,
  ExternalLink
} from 'lucide-react';

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

interface SidebarProps {
  handleNewConversion: () => void;
  recentConversions: Conversion[];
  onSelectConversion: (conversion: Conversion) => void;
  onClearHistory: () => void;
  currentConversion?: Conversion | null;
}

export function Sidebar({ 
  handleNewConversion,
  recentConversions, 
  onSelectConversion, 
  onClearHistory,
  currentConversion 
}: SidebarProps) {
  return (
    <div className="w-64 bg-primary flex flex-col h-full">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-md text-sidebar-foreground font-[monoSpace] cursor-pointer" onClick={handleNewConversion}>url2.md</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {/* Recent Section */}
          <div className="mb-4">
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-sidebar-foreground text-sm font-bold">
                Recent Conversions
                { recentConversions.length > 0 && (
                <button
                  className="ml-auto p-1 rounded hover:bg-sidebar-accent-foreground/10 transition-colors cursor-pointer"
                    onClick={onClearHistory}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Conversions List */}
          <div className="space-y-1 mb-6">
            {recentConversions.length === 0 ? (
              <div className="px-3 py-6 text-left text-sidebar-foreground/60 text-sm">
                No recent conversions
              </div>
            ) : (
              <>
                {recentConversions.map((conversion) => (
                  <div
                    key={conversion.id}
                    className={`group cursor-pointer rounded-lg p-2 transition-colors hover:bg-black/10 ${
                      currentConversion?.id === conversion.id ? '' : ''
                    }`}
                    onClick={() => onSelectConversion(conversion)}
                  >
                      <div className="min-w-0 flex-1 flex justify-between items-center">
                        <p className="text-sm text-sidebar-foreground truncate">
                          {conversion.title || 'Unknown'}
                        </p>
                        {(() => {
                          try {
                            return (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent-foreground/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(conversion.url, '_blank');
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            );
                          } catch {
                            return;
                          }
                        })()}
                      </div>
                    </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <p className="text-xs text-sidebar-foreground/60 text-center">
          Easily convert any webpage to clean Markdown
        </p>
      </div>
    </div>
  );
}