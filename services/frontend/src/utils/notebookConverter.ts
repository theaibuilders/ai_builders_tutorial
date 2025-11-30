import fs from 'fs';

/**
 * Robust notebook converter using professional techniques
 * Handles both VS Code XML format and standard Jupyter JSON
 */

export interface NotebookCell {
  cell_type: 'code' | 'markdown';
  source: string | string[];
  metadata?: any;
  outputs?: any[];
  execution_count?: number | null;
}

export interface NotebookData {
  cells: NotebookCell[];
  metadata: any;
  nbformat: number;
  nbformat_minor: number;
}

/**
 * Convert VS Code XML notebook format to standard Jupyter JSON
 */
export function convertVSCodeNotebookToJupyter(content: string): NotebookData {
  const cells: NotebookCell[] = [];
  
  // Comprehensive regex to extract VS Code cells
  const cellRegex = /<VSCode\.Cell[^>]*id="([^"]*)"[^>]*language="([^"]*)"[^>]*>([\s\S]*?)<\/VSCode\.Cell>/g;
  let match;
  
  while ((match = cellRegex.exec(content)) !== null) {
    const [, id, language, cellContent] = match;
    
    // Ultra-aggressive cleaning of VS Code XML artifacts
    const cleanContent = cleanVSCodeCellContent(cellContent);
    
    cells.push({
      cell_type: language === 'markdown' ? 'markdown' : 'code',
      source: cleanContent.split('\n'),
      metadata: {},
      outputs: [],
      execution_count: null
    });
  }
  
  return createStandardNotebook(cells);
}

/**
 * Comprehensive cleaning of VS Code cell content
 */
function cleanVSCodeCellContent(content: string): string {
  return content
    // Remove all HTML tags completely
    .replace(/<[^>]*>/g, '')
    
    // Remove all class and style attributes
    .replace(/class="[^"]*"/gi, '')
    .replace(/style="[^"]*"/gi, '')
    
    // Remove CSS-like formatting artifacts
    .replace(/text-[a-z]+-\d+/gi, '')
    .replace(/font-[a-z-]+/gi, '')
    .replace(/bg-[a-z]+-\d+/gi, '')
    
    // Remove numbered formatting artifacts
    .replace(/\d+\s*(italic|bold|semibold|font-[a-z-]+)/gi, '')
    .replace(/^\s*\d{3,4}\s+/gm, '')
    .replace(/\s+\d{3,4}\s+/g, ' ')
    .replace(/\b(400|500|600|700|800|900)\s+/g, '')
    
    // Remove CSS property patterns
    .replace(/>\s*"[^"]*"/g, '')
    .replace(/"[^"]*">/g, '')
    
    // Clean HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    
    // Remove artifact patterns in code
    .replace(/([a-zA-Z_]\w*)\s*\d+\s*([a-zA-Z_]\w*)/g, '$1 $2')
    .replace(/import\s+\d+\s+/g, 'import ')
    .replace(/from\s+\d+\s+/g, 'from ')
    .replace(/def\s+\d+\s+/g, 'def ')
    .replace(/class\s+\d+\s+/g, 'class ')
    .replace(/print\s+\d+\s*\(/g, 'print(')
    .replace(/pip\s+\d+\s+install/g, 'pip install')
    
    // Clean up comment artifacts
    .replace(/#\s*\d+\s*([a-zA-Z])/g, '# $1')
    
    // Remove standalone numbers that are artifacts
    .replace(/^\d+\s+/gm, '')
    .replace(/\s+\d+(?=\s|$)/g, '')
    
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
}

/**
 * Create a standard Jupyter notebook structure
 */
function createStandardNotebook(cells: NotebookCell[]): NotebookData {
  return {
    cells,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      },
      language_info: {
        name: "python",
        version: "3.8.0",
        mimetype: "text/x-python",
        codemirror_mode: {
          name: "ipython",
          version: 3
        },
        pygments_lexer: "ipython3", 
        nbconvert_exporter: "python",
        file_extension: ".py"
      }
    },
    nbformat: 4,
    nbformat_minor: 4
  };
}

/**
 * Load and convert notebook from file
 */
export function loadNotebook(filePath: string): NotebookData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it's VS Code XML format
    if (content.includes('<VSCode.Cell')) {
      return convertVSCodeNotebookToJupyter(content);
    } else {
      // Parse as standard Jupyter JSON
      const notebook = JSON.parse(content);
      
      // Ensure it has the right structure
      if (notebook.cells && Array.isArray(notebook.cells)) {
        return notebook;
      } else {
        console.error(`Invalid notebook format: ${filePath}`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error loading notebook ${filePath}:`, error);
    return null;
  }
}

/**
 * Validate notebook structure
 */
export function validateNotebook(notebook: any): notebook is NotebookData {
  return (
    notebook &&
    typeof notebook === 'object' &&
    Array.isArray(notebook.cells) &&
    typeof notebook.nbformat === 'number' &&
    notebook.metadata
  );
}
