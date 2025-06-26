import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

// Configure marked with proper options
marked.setOptions({
  breaks: true,
  gfm: true,
});

type MarkdownEditorProps = {
  initialMarkdown?: string;
  metadata?: {
    title?: string;
    [key: string]: any;
  };
};

const MarkdownEditor = ({
  initialMarkdown = "",
  metadata = {},
}: MarkdownEditorProps) => {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      alert('Markdown copied to clipboard!');
    } catch (err) {
      console.log('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const filename = metadata?.title 
        ? `${metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.md`
        : `converted-${Date.now()}.md`;
      
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      alert('Markdown file downloaded successfully!');
    } catch (err) {
      console.log('Failed to download file');
    }
  };

  const renderPreview = () => {
    try {
      return { __html: marked(markdown) };
    } catch (err) {
      return { __html: '<p style="color: #ef4444;">Error rendering markdown preview</p>' };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          HTML to Markdown Converter
        </h1>
        <p className="text-gray-600">
          Convert and edit your markdown with live preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Editor Panel */}
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Markdown Editor
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-0">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-full resize-none border-0 p-4 focus:outline-none focus:ring-0 font-mono text-sm"
              placeholder="Your converted markdown will appear here..."
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview
            </h2>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h4:font-medium prose-h4:mb-2 prose-h5:font-medium prose-h5:mb-1 prose-h6:font-medium prose-h6:mb-1 prose-p:text-gray-700 prose-p:mb-4 prose-strong:text-gray-900 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-1 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
              style={{
                // Custom styles to ensure headings are properly sized
                '--tw-prose-headings': '#111827',
                '--tw-prose-h1': '#111827',
                '--tw-prose-h2': '#111827',
                '--tw-prose-h3': '#111827',
                '--tw-prose-h4': '#111827',
                '--tw-prose-h5': '#111827',
                '--tw-prose-h6': '#111827',
              } as React.CSSProperties}
              dangerouslySetInnerHTML={renderPreview()}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to use:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <p className="font-medium">Paste HTML</p>
            <p className="text-gray-600">Paste your HTML content or convert from URL</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <p className="font-medium">Edit Markdown</p>
            <p className="text-gray-600">Edit the converted markdown in the left panel</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <p className="font-medium">Preview & Export</p>
            <p className="text-gray-600">See live preview and copy or download your markdown</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;