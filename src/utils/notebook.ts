import type { JupyterCell, JupyterNotebook } from '../types/tutorial';
import { getHighlighter } from 'shiki';

/**
 * Converts Jupyter notebook cells to HTML
 */
export class NotebookRenderer {
  private highlighter: any;

  constructor() {
    this.initHighlighter();
  }

  private async initHighlighter() {
    try {
      this.highlighter = await getHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['python', 'javascript', 'typescript', 'bash', 'json', 'markdown']
      });
    } catch (error) {
      console.warn('Failed to initialize syntax highlighter:', error);
    }
  }

  /**
   * Renders a Jupyter notebook to HTML
   */
  async renderNotebook(notebook: JupyterNotebook): Promise<string> {
    if (!this.highlighter) {
      await this.initHighlighter();
    }

    const cellsHtml = await Promise.all(
      notebook.cells.map(cell => this.renderCell(cell))
    );

    return cellsHtml.join('\n');
  }

  /**
   * Renders a single Jupyter cell to HTML
   */
  async renderCell(cell: JupyterCell): Promise<string> {
    const cellId = this.generateCellId();
    
    switch (cell.cell_type) {
      case 'markdown':
        return this.renderMarkdownCell(cell, cellId);
      case 'code':
        return await this.renderCodeCell(cell, cellId);
      case 'raw':
        return this.renderRawCell(cell, cellId);
      default:
        return '';
    }
  }

  /**
   * Renders a markdown cell
   */
  private renderMarkdownCell(cell: JupyterCell, cellId: string): string {
    const source = cell.source.join('');
    const markdownHtml = this.parseMarkdown(source);
    
    return `
      <div class="notebook-cell markdown-cell" data-cell-id="${cellId}">
        <div class="cell-content prose prose-dark dark:prose-dark max-w-none">
          ${markdownHtml}
        </div>
      </div>
    `;
  }

  /**
   * Renders a code cell
   */
  private async renderCodeCell(cell: JupyterCell, cellId: string): Promise<string> {
    const source = cell.source.join('');
    const language = this.detectLanguage(cell);
    
    let highlightedCode = source;
    if (this.highlighter) {
      try {
        highlightedCode = this.highlighter.codeToHtml(source, {
          lang: language,
          theme: 'github-dark'
        });
      } catch (error) {
        console.warn('Failed to highlight code:', error);
        highlightedCode = `<pre><code>${this.escapeHtml(source)}</code></pre>`;
      }
    } else {
      highlightedCode = `<pre><code class="language-${language}">${this.escapeHtml(source)}</code></pre>`;
    }

    const outputsHtml = cell.outputs ? this.renderOutputs(cell.outputs) : '';
    const executionCount = cell.execution_count ? `[${cell.execution_count}]` : '[ ]';

    return `
      <div class="notebook-cell code-cell" data-cell-id="${cellId}">
        <div class="cell-input">
          <div class="cell-prompt">
            <span class="execution-count">In ${executionCount}:</span>
          </div>
          <div class="cell-code-container relative">
            <copy-button class="absolute top-2 right-2" data-content="${this.escapeHtml(source)}"></copy-button>
            <div class="cell-code">${highlightedCode}</div>
          </div>
        </div>
        ${outputsHtml ? `<div class="cell-output">${outputsHtml}</div>` : ''}
      </div>
    `;
  }

  /**
   * Renders a raw cell
   */
  private renderRawCell(cell: JupyterCell, cellId: string): string {
    const source = cell.source.join('');
    
    return `
      <div class="notebook-cell raw-cell" data-cell-id="${cellId}">
        <div class="cell-content">
          <pre class="raw-content">${this.escapeHtml(source)}</pre>
        </div>
      </div>
    `;
  }

  /**
   * Renders cell outputs
   */
  private renderOutputs(outputs: any[]): string {
    return outputs.map(output => {
      switch (output.output_type) {
        case 'stream':
          return this.renderStreamOutput(output);
        case 'display_data':
        case 'execute_result':
          return this.renderDisplayOutput(output);
        case 'error':
          return this.renderErrorOutput(output);
        default:
          return '';
      }
    }).join('\n');
  }

  /**
   * Renders stream output (stdout, stderr)
   */
  private renderStreamOutput(output: any): string {
    const text = Array.isArray(output.text) ? output.text.join('') : output.text || '';
    const streamType = output.name || 'stdout';
    
    return `
      <div class="output-stream output-${streamType}">
        <pre>${this.escapeHtml(text)}</pre>
      </div>
    `;
  }

  /**
   * Renders display data or execute result
   */
  private renderDisplayOutput(output: any): string {
    const data = output.data || {};
    
    // Priority order for display formats
    if (data['text/html']) {
      return `<div class="output-html">${Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html']}</div>`;
    }
    
    if (data['image/png']) {
      return `<div class="output-image"><img src="data:image/png;base64,${data['image/png']}" alt="Output image" /></div>`;
    }
    
    if (data['image/jpeg']) {
      return `<div class="output-image"><img src="data:image/jpeg;base64,${data['image/jpeg']}" alt="Output image" /></div>`;
    }
    
    if (data['text/plain']) {
      const text = Array.isArray(data['text/plain']) ? data['text/plain'].join('') : data['text/plain'];
      return `<div class="output-text"><pre>${this.escapeHtml(text)}</pre></div>`;
    }
    
    return '';
  }

  /**
   * Renders error output
   */
  private renderErrorOutput(output: any): string {
    const ename = output.ename || 'Error';
    const evalue = output.evalue || '';
    const traceback = output.traceback || [];
    
    return `
      <div class="output-error">
        <div class="error-name">${this.escapeHtml(ename)}</div>
        ${evalue ? `<div class="error-value">${this.escapeHtml(evalue)}</div>` : ''}
        ${traceback.length > 0 ? `<div class="error-traceback"><pre>${this.escapeHtml(traceback.join('\n'))}</pre></div>` : ''}
      </div>
    `;
  }

  /**
   * Detects the programming language from cell metadata
   */
  private detectLanguage(cell: JupyterCell): string {
    // Check cell metadata for language
    if (cell.metadata?.language) {
      return cell.metadata.language;
    }
    
    // Default to python for code cells
    return 'python';
  }

  /**
   * Simple markdown parser (can be replaced with a more robust solution)
   */
  private parseMarkdown(markdown: string): string {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Code (inline)
      .replace(/`([^`]*)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>');
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generates a unique cell ID
   */
  private generateCellId(): string {
    return `cell-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Utility function to render markdown content
 */
export function renderMarkdown(content: string): string {
  const renderer = new NotebookRenderer();
  return renderer['parseMarkdown'](content);
}

/**
 * Extracts headings from markdown content with proper IDs
 */
export function extractMarkdownHeadings(content: string): Array<{id: string, text: string, level: number}> {
  const headings: Array<{id: string, text: string, level: number}> = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      
      // Clean up markdown formatting for display text
      const cleanText = rawText
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold formatting **text**
        .replace(/\*(.*?)\*/g, '$1')      // Remove italic formatting *text*
        .replace(/`([^`]+)`/g, '$1')      // Remove inline code formatting `code`
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link formatting [text](url)
        .trim();
      
      // Generate ID from cleaned text
      const id = cleanText.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      if (level >= 2 && level <= 3) { // Only h2 and h3 for TOC
        headings.push({ id, text: cleanText, level });
      }
    }
  }
  
  return headings;
}
