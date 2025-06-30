# URL to Markdown Converter

A simple web app that turns any webpage into clean markdown. Just paste a URL and get formatted markdown you can copy, edit, or download.

## Features

- Convert any webpage to markdown
- Live preview with syntax highlighting  
- Copy markdown or Word-formatted text
- Download as .md or .doc files
- History of recent conversions
- Clean, responsive interface

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any URL to get started.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Mozilla Readability for content extraction
- Turndown for markdown conversion

## Usage

1. Enter any webpage URL
2. Click Convert
3. Edit the markdown if needed
4. Copy or download your content

The app extracts the main content from webpages and converts it to clean, readable markdown while preserving formatting like headers, links, lists, and code blocks.