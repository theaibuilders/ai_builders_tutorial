import fs from 'fs';
import path from 'path';
import type { TutorialFile, TutorialSection, AuthorMetadata } from '../types/tutorial';
import { convertVSCodeNotebookToJupyter } from './notebookConverter';

const TUTORIALS_DIR = path.join(process.cwd(), 'tutorials');
const DRAFTS_DIR = path.join(process.cwd(), '..', '..', 'tutorials_draft');
const METADATA_CONFIG_PATH = path.join(process.cwd(), 'tutorial-metadata.json');
const AUTHOR_METADATA_PATH = path.join(process.cwd(), 'author-metadata.json');
const VISIBILITY_CONFIG_PATH = path.join(process.cwd(), 'tutorial-visibility.json');

// Get tutorials directory for a specific language
export function getTutorialsDir(language: string = 'en'): string {
  if (language === 'en') {
    return TUTORIALS_DIR;
  }
  return path.join(process.cwd(), `tutorials-${language}`);
}

// Check if a translated file exists for a given path and language
export function getTranslatedFilePath(tutorialPath: string, language: string): string | null {
  if (language === 'en') {
    return null; // English is the default, no translation needed
  }
  
  const translatedDir = getTutorialsDir(language);
  
  // Try different extensions
  const extensions = ['.mdx', '.md', '.ipynb'];
  for (const ext of extensions) {
    const basePath = tutorialPath.replace(/\.(md|mdx|ipynb)$/, '');
    const translatedPath = path.join(translatedDir, basePath + ext);
    if (fs.existsSync(translatedPath)) {
      return translatedPath;
    }
  }
  
  return null;
}

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

// Load visibility configuration
function loadVisibilityConfig(): Record<string, { masked: boolean }> {
  try {
    if (fs.existsSync(VISIBILITY_CONFIG_PATH)) {
      const content = fs.readFileSync(VISIBILITY_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(content);
      return config.tutorials || {};
    }
  } catch (error) {
    console.error('Error loading visibility config:', error);
  }
  return {};
}

const authorMetadata = loadAuthorMetadata();
const metadataOverrides = loadMetadataOverrides();
const visibilityConfig = loadVisibilityConfig();

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

    // Skip obviously truncated / empty files
    if (!content || content.trim().length === 0) {
      console.warn(`Notebook file empty or missing content: ${filePath} - skipping.`);
      return null;
    }

    // Check if it's VS Code XML format
    if (content.includes('<VSCode.Cell')) {
      try {
        return convertVSCodeNotebookToJupyter(content);
      } catch (convErr) {
        console.error(`Conversion failed for VSCode notebook ${filePath}:`, convErr);
        return null;
      }
    }

    // Guard against clearly truncated JSON (very naive heuristic)
    const trimmed = content.trim();
    if (!(trimmed.startsWith('{') && (trimmed.endsWith('}') || trimmed.endsWith('}\n')))) {
      console.warn(`Notebook JSON appears truncated or malformed (braces mismatch) in ${filePath} - skipping.`);
      return null;
    }

    try {
      return JSON.parse(content);
    } catch (parseErr) {
      console.error(`JSON parse failed for notebook ${filePath}:`, parseErr);
      return null;
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
    tags: [],
    masked: false
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
    
    // Apply visibility configuration
    if (visibilityConfig[filePath]) {
      finalMetadata.masked = visibilityConfig[filePath].masked;
    }
    
    return finalMetadata;
  }
  
  // Apply visibility configuration even without metadata overrides
  if (filePath && visibilityConfig[filePath]) {
    defaultMetadata.masked = visibilityConfig[filePath].masked;
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
    tags: ['jupyter', 'tutorial'],
    masked: false
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
    
    // Apply visibility configuration
    if (visibilityConfig[filePath]) {
      finalMetadata.masked = visibilityConfig[filePath].masked;
    }
    
    return finalMetadata;
  }
  
  // Apply visibility configuration even without metadata overrides
  if (filePath && visibilityConfig[filePath]) {
    defaultMetadata.masked = visibilityConfig[filePath].masked;
  }
  
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

export function scanDraftTutorialsDirectory(): TutorialSection[] {
  const sections: TutorialSection[] = [];

  try {
    if (!fs.existsSync(DRAFTS_DIR)) {
      return sections;
    }

    const sectionDirs = fs.readdirSync(DRAFTS_DIR).filter(item => {
      const fullPath = path.join(DRAFTS_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const sectionDir of sectionDirs) {
      const sectionPath = path.join(DRAFTS_DIR, sectionDir);
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
          console.error(`Error processing draft file ${filePath}:`, error);
        }
      }

      // Sort files alphabetically
      files.sort((a, b) => a.name.localeCompare(b.name));

      sections.push({
        name: sectionDir.charAt(0).toUpperCase() + sectionDir.slice(1),
        path: sectionDir,
        files
      });
    }

    // Sort sections alphabetically
    sections.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error scanning drafts directory:', error);
  }

  return sections;
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

// Load translated content for a tutorial file if available
export function loadTranslatedTutorial(originalFile: TutorialFile, language: string): TutorialFile | null {
  if (!language || language === 'en') {
    return null; // No translation needed for English
  }
  
  const translatedPath = getTranslatedFilePath(originalFile.path, language);
  if (!translatedPath) {
    console.log(`No translation found for ${originalFile.path} in ${language}`);
    return null; // No translation available
  }
  
  console.log(`Loading translated file from: ${translatedPath}`);
  
  try {
    const isNotebook = translatedPath.endsWith('.ipynb');
    const isMarkdown = translatedPath.endsWith('.md') || translatedPath.endsWith('.mdx');
    
    if (isMarkdown) {
      const content = readMarkdownFile(translatedPath);
      if (content) {
        const metadata = extractMarkdownMetadata(content, originalFile.path);
        return {
          ...originalFile,
          content,
          metadata: {
            ...originalFile.metadata,
            ...metadata,
            title: metadata.title || originalFile.metadata.title
          }
        };
      }
    } else if (isNotebook) {
      const notebook = readNotebookFile(translatedPath);
      if (notebook) {
        const metadata = extractNotebookMetadata(notebook, originalFile.path);
        return {
          ...originalFile,
          notebook,
          metadata: {
            ...originalFile.metadata,
            ...metadata,
            title: metadata.title || originalFile.metadata.title
          }
        };
      }
    }
  } catch (error) {
    console.error(`Error loading translated file ${translatedPath}:`, error);
  }
  
  return null;
}
