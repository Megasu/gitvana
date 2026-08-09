// Shared plain-text -> block renderer for guide `content` and command `advanced`
// fields. Both are a small markdown-ish dialect: `##`/`###` headers, fenced
// ``` code blocks, blank-line spacers, and plain paragraphs -- see
// CONTRIBUTING_TRANSLATIONS.md for the exact contract translators write against.
//
// Previously this lived as two byte-identical copies inside DocsPage.svelte
// and DocPopup.svelte (and a third, buggier variant handled `advanced`
// separately). Consolidated here so all three render consistently and any
// future fix only needs to happen once.

export interface ContentBlock {
  type: 'h3' | 'h4' | 'code-block' | 'blank' | 'p';
  text: string;
}

/** Split a markdown-ish content string into typed blocks. */
export function renderGuideContent(content: string): ContentBlock[] {
  const lines = content.split('\n');
  const result: ContentBlock[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        result.push({ type: 'code-block', text: codeLines.join('\n') });
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      result.push({ type: 'h4', text: line.slice(4) });
    } else if (line.startsWith('## ')) {
      result.push({ type: 'h3', text: line.slice(3) });
    } else if (line.trim() === '') {
      result.push({ type: 'blank', text: '' });
    } else {
      result.push({ type: 'p', text: line });
    }
  }

  // An unclosed fence silently swallows the rest of the content into one
  // code block. Surface it instead of hiding the tail end of the text.
  if (inCodeBlock && codeLines.length > 0) {
    result.push({ type: 'code-block', text: codeLines.join('\n') });
  }

  return result;
}

/** Render inline `**bold**` and `` `code` `` within a paragraph/heading line. HTML-escapes first, so raw HTML in content can never reach the DOM. */
export function renderInline(text: string): string {
  // escape html
  let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // bold
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // inline code
  s = s.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return s;
}
