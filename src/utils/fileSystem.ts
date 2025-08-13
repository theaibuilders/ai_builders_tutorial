import fs from 'fs';
import path from 'path';
import type { TutorialFile, TutorialSection, AuthorMetadata } from '../types/tutorial';
import { convertVSCodeNotebookToJupyter } from './notebookConverter';

const TUTORIALS_DIR = path.join(process.cwd(), 'tutorials');
const METADATA_CONFIG_PATH = path.join(process.cwd(), 'tutorial-metadata.json');
const AUTHOR_METADATA_PATH = path.join(process.cwd(), 'author-metadata.json');

// Load author metadata
function loadAuthorMetadata(): Record<string, AuthorMetadata> {
  try {
    if (fs.existsSync(AUTHOR_METADATA_PATH)) {
      const content = fs.readFileSync(AUTHOR_METADATA_PATH, 'utf-8');
      const config = JSON.parse(content);
      return config.authors || {};
    }
  } catch (error) {
    console.error('Error loading author metadata:', error);
  }
  return {};
}

// Load manual metadata overrides
function loadMetadataOverrides(): Record<string, any> {
  try {
    if (fs.existsSync(METADATA_CONFIG_PATH)) {
      const content = fs.readFileSync(METADATA_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(content);
      return config.tutorials || {};
    }
  } catch (error) {
    console.error('Error loading metadata overrides:', error);
  }
  return {};
}

const authorMetadata = loadAuthorMetadata();
const metadataOverrides = loadMetadataOverrides();

// Resolve author information from authorId
function resolveAuthorInfo(authorId?: string): { author?: string; authorPicture?: string; authorUrl?: string } {
  if (!authorId || !authorMetadata[authorId]) {
    return {};
  }
  
  const authorInfo = authorMetadata[authorId];
  return {
    author: authorInfo.name,
    authorPicture: authorInfo.picture,
    authorUrl: authorInfo.url
  };
}

export function readMarkdownFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading markdown file ${filePath}:`, error);
    return '';
  }
}

export function readNotebookFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it's VS Code XML format
    if (content.includes('<VSCode.Cell')) {
      return convertVSCodeNotebookToJupyter(content);
    } else {
      // Try to parse as standard Jupyter JSON
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading notebook file ${filePath}:`, error);
    return null;
  }
}

export function extractMarkdownMetadata(content: string, filePath?: string): any {
  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';
  
  // Default metadata
  const defaultMetadata = {
    title,
    author: 'AI Builders Team',
    lastUpdated: '2025-01-01',
    difficulty: 'beginner',
    tags: []
  };

  // Apply manual overrides if they exist  
  if (filePath && metadataOverrides[filePath]) {
    const overrides = metadataOverrides[filePath];
    
    // Resolve author information if authorId is provided
    const authorInfo = resolveAuthorInfo(overrides.authorId);
    
    const finalMetadata = {
      ...defaultMetadata,
      ...overrides,
      ...authorInfo // This will override any existing author fields with resolved data
    };
    return finalMetadata;
  }
  
  return defaultMetadata;
}

export function extractNotebookMetadata(notebook: any, filePath?: string): any {
  // Try to get title from first markdown cell
  let title = 'Untitled Notebook';
  
  if (notebook && notebook.cells && notebook.cells.length > 0) {
    const firstCell = notebook.cells.find((cell: any) => cell.cell_type === 'markdown');
    if (firstCell && firstCell.source) {
      const source = Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source;
      const titleMatch = source.match(/^#{1,3}\s*\*?\*?(.+?)\*?\*?$/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }
  }
  
  // Default metadata
  const defaultMetadata = {
    title,
    author: 'AI Builders Team',
    lastUpdated: '2025-01-01',
    difficulty: 'beginner',
    tags: ['jupyter', 'tutorial']
  };

  // Apply manual overrides if they exist
  if (filePath && metadataOverrides[filePath]) {
    const overrides = metadataOverrides[filePath];
    
    // Resolve author information if authorId is provided
    const authorInfo = resolveAuthorInfo(overrides.authorId);
    
    const finalMetadata = {
      ...defaultMetadata,
      ...overrides,
      ...authorInfo // This will override any existing author fields with resolved data
    };
    return finalMetadata;
  }
  
  return defaultMetadata;
  return defaultMetadata;
}

export function scanTutorialsDirectory(): TutorialSection[] {
  const sections: TutorialSection[] = [];
  let folderOrder: string[] | undefined = undefined;
  try {
    // Load folderOrder from tutorial-metadata.json if present
    if (fs.existsSync(METADATA_CONFIG_PATH)) {
      const content = fs.readFileSync(METADATA_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(content);
      if (Array.isArray(config.folderOrder)) {
        folderOrder = config.folderOrder;
      }
    }
    const sectionDirs = fs.readdirSync(TUTORIALS_DIR).filter(item => {
      const fullPath = path.join(TUTORIALS_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });
    for (const sectionDir of sectionDirs) {
      const sectionPath = path.join(TUTORIALS_DIR, sectionDir);
      const files: TutorialFile[] = [];
      const fileNames = fs.readdirSync(sectionPath).filter(file =>
        file.endsWith('.md') || file.endsWith('.mdx') || file.endsWith('.ipynb')
      );
      for (const fileName of fileNames) {
        const filePath = path.join(sectionPath, fileName);
        const relativePath = `${sectionDir}/${fileName}`;
        try {
          if (fileName.endsWith('.md') || fileName.endsWith('.mdx')) {
            const content = readMarkdownFile(filePath);
            if (content) {
              const metadata = extractMarkdownMetadata(content, relativePath);
              files.push({
                path: relativePath,
                name: fileName,
                type: 'markdown',
                content,
                metadata
              });
            }
          } else if (fileName.endsWith('.ipynb')) {
            const notebook = readNotebookFile(filePath);
            if (notebook) {
              const metadata = extractNotebookMetadata(notebook, relativePath);
              files.push({
                path: relativePath,
                name: fileName,
                type: 'notebook',
                notebook,
                metadata
              });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
        }
      }
      // Sort files within each section, prioritizing tutorial_overview.(md|mdx)
      files.sort((a, b) => {
        const isOverviewA = /^tutorial_overview\.(md|mdx)$/.test(a.name);
        const isOverviewB = /^tutorial_overview\.(md|mdx)$/.test(b.name);
        if (isOverviewA && !isOverviewB) return -1;
        if (!isOverviewA && isOverviewB) return 1;
        return a.name.localeCompare(b.name);
      });
      sections.push({
        name: sectionDir.charAt(0).toUpperCase() + sectionDir.slice(1),
        path: sectionDir,
        files
      });
    }
  } catch (error) {
    console.error('Error scanning tutorials directory:', error);
  }
  // If folderOrder is present, use it to order sections
  if (folderOrder) {
    // Map section names to section objects
    const sectionMap = Object.fromEntries(sections.map(s => [s.name, s]));
    // Build ordered array, only including sections that exist
    const orderedSections = folderOrder.map(name => sectionMap[name]).filter(Boolean);
    // Add any sections not in folderOrder at the end (preserve their original order)
    const remainingSections = sections.filter(s => !folderOrder!.includes(s.name));
    return [...orderedSections, ...remainingSections];
  } else {
    // Fallback: Overview first, then alphabetical
    sections.sort((a, b) => {
      if (a.name === 'Overview') return -1;
      if (b.name === 'Overview') return 1;
      return a.name.localeCompare(b.name);
    });
    return sections;
  }
}

export function findTutorialFile(sections: TutorialSection[], targetPath: string): TutorialFile | undefined {
  for (const section of sections) {
    const file = section.files.find(f => {
  const pathWithoutExt = f.path.replace(/\.(md|mdx|ipynb)$/, '');
      return pathWithoutExt === targetPath || f.path.includes(targetPath);
    });
    if (file) {
      return file;
    }
  }
  return undefined;
}
