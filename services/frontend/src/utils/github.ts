import type { 
  JupyterNotebook, 
  TutorialFile, 
  TutorialSection, 
  GitHubFile, 
  GitHubTree,
  TutorialMetadata 
} from '../types/tutorial';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'devonsunml'; // Replace with actual repo owner
const REPO_NAME = 'ai_builders_tutorial'; // Replace with actual repo name
const TUTORIALS_PATH = 'tutorials';

/**
 * Fetches file content from GitHub
 */
export async function fetchGitHubFile(path: string): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.type !== 'file') {
      throw new Error('Path does not point to a file');
    }
    
    // Decode base64 content
    return atob(data.content.replace(/\s/g, ''));
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    throw error;
  }
}

/**
 * Fetches directory tree from GitHub
 */
export async function fetchGitHubTree(path: string = TUTORIALS_PATH): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch directory: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching directory ${path}:`, error);
    throw error;
  }
}

/**
 * Parses a Jupyter notebook JSON string
 */
export function parseJupyterNotebook(content: string): JupyterNotebook {
  try {
    return JSON.parse(content) as JupyterNotebook;
  } catch (error) {
    console.error('Error parsing Jupyter notebook:', error);
    throw new Error('Invalid Jupyter notebook format');
  }
}

/**
 * Extracts metadata from a tutorial file
 */
export function extractTutorialMetadata(
  filename: string, 
  content: string, 
  isNotebook: boolean = false
): TutorialMetadata {
  const defaultMetadata: TutorialMetadata = {
    title: filename.replace(/\.(md|ipynb)$/, '').replace(/[-_]/g, ' '),
    lastUpdated: new Date().toISOString(),
  };

  if (isNotebook) {
    try {
      const notebook = parseJupyterNotebook(content);
      const firstMarkdownCell = notebook.cells.find(cell => 
        cell.cell_type === 'markdown' && cell.source.length > 0
      );
      
      if (firstMarkdownCell) {
        const firstLine = firstMarkdownCell.source[0].trim();
        if (firstLine.startsWith('#')) {
          defaultMetadata.title = firstLine.replace(/^#+\s*/, '');
        }
      }
      
      // Extract metadata from notebook metadata if available
      if (notebook.metadata) {
        const nbMeta = notebook.metadata as any;
        if (nbMeta.title) defaultMetadata.title = nbMeta.title;
        if (nbMeta.author) defaultMetadata.author = nbMeta.author;
        if (nbMeta.description) defaultMetadata.description = nbMeta.description;
        if (nbMeta.tags) defaultMetadata.tags = nbMeta.tags;
        if (nbMeta.difficulty) defaultMetadata.difficulty = nbMeta.difficulty;
      }
    } catch (error) {
      console.warn('Could not extract metadata from notebook:', error);
    }
  } else {
    // Extract metadata from markdown frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        const frontmatter = frontmatterMatch[1];
        const lines = frontmatter.split('\n');
        
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim().replace(/['"]/g, '');
            switch (key.trim()) {
              case 'title':
                defaultMetadata.title = value;
                break;
              case 'author':
                defaultMetadata.author = value;
                break;
              case 'description':
                defaultMetadata.description = value;
                break;
              case 'difficulty':
                if (['beginner', 'intermediate', 'advanced'].includes(value)) {
                  defaultMetadata.difficulty = value as any;
                }
                break;
              case 'tags':
                defaultMetadata.tags = value.split(',').map(t => t.trim());
                break;
            }
          }
        }
      } catch (error) {
        console.warn('Could not parse frontmatter:', error);
      }
    }
    
    // Fallback: extract title from first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch && !frontmatterMatch) {
      defaultMetadata.title = headingMatch[1];
    }
  }

  return defaultMetadata;
}

/**
 * Builds the complete tutorial structure from GitHub
 */
export async function buildTutorialStructure(): Promise<TutorialSection[]> {
  try {
    const rootFiles = await fetchGitHubTree();
    const sections: TutorialSection[] = [];
    
    for (const item of rootFiles) {
      if (item.type === 'dir') {
        const sectionFiles = await fetchGitHubTree(item.path);
        const tutorialFiles: TutorialFile[] = [];
        
        for (const file of sectionFiles) {
          if (file.type === 'file' && (file.name.endsWith('.md') || file.name.endsWith('.ipynb'))) {
            try {
              const content = await fetchGitHubFile(file.path);
              const isNotebook = file.name.endsWith('.ipynb');
              
              const tutorialFile: TutorialFile = {
                path: file.path,
                name: file.name,
                type: isNotebook ? 'notebook' : 'markdown',
                content: content,
                metadata: extractTutorialMetadata(file.name, content, isNotebook)
              };
              
              if (isNotebook) {
                tutorialFile.notebook = parseJupyterNotebook(content);
              }
              
              tutorialFiles.push(tutorialFile);
            } catch (error) {
              console.warn(`Failed to process file ${file.path}:`, error);
            }
          }
        }
        
        if (tutorialFiles.length > 0) {
          sections.push({
            name: item.name.replace(/[-_]/g, ' '),
            path: item.path,
            files: tutorialFiles.sort((a, b) => a.name.localeCompare(b.name))
          });
        }
      }
    }
    
    return sections.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error building tutorial structure:', error);
    throw error;
  }
}

/**
 * Finds a specific tutorial file by path
 */
export async function getTutorialByPath(sections: TutorialSection[], targetPath: string): Promise<TutorialFile | null> {
  for (const section of sections) {
    const file = section.files.find(f => f.path === targetPath || f.path.endsWith(targetPath));
    if (file) return file;
    
    if (section.subsections) {
      const nestedFile = await getTutorialByPath(section.subsections, targetPath);
      if (nestedFile) return nestedFile;
    }
  }
  return null;
}

/**
 * Extracts headings from rendered HTML content for TOC generation
 */
export function extractHeadings(htmlContent: string): Array<{id: string, text: string, level: number}> {
  const headings: Array<{id: string, text: string, level: number}> = [];
  const headingRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  
  let match;
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, ''); // Strip HTML tags
    
    headings.push({ id, text, level });
  }
  
  return headings;
}

/**
 * Searches through tutorials based on query
 */
export function searchTutorials(sections: TutorialSection[], query: string): TutorialFile[] {
  const results: TutorialFile[] = [];
  const lowercaseQuery = query.toLowerCase();
  
  for (const section of sections) {
    for (const file of section.files) {
      // Search in title
      if (file.metadata.title.toLowerCase().includes(lowercaseQuery)) {
        results.push(file);
        continue;
      }
      
      // Search in description
      if (file.metadata.description?.toLowerCase().includes(lowercaseQuery)) {
        results.push(file);
        continue;
      }
      
      // Search in content
      if (file.content?.toLowerCase().includes(lowercaseQuery)) {
        results.push(file);
        continue;
      }
      
      // Search in notebook cells
      if (file.notebook) {
        const hasMatch = file.notebook.cells.some(cell => 
          cell.source.some(line => line.toLowerCase().includes(lowercaseQuery))
        );
        if (hasMatch) {
          results.push(file);
        }
      }
    }
    
    if (section.subsections) {
      results.push(...searchTutorials(section.subsections, query));
    }
  }
  
  return results;
}
