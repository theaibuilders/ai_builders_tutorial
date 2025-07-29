import fs from 'fs';
import path from 'path';
import type { TutorialFile, TutorialSection } from '../types/tutorial';
import { convertVSCodeNotebookToJupyter } from './notebookConverter';

const TUTORIALS_DIR = '/Users/devon/ai_builders_tutorial/tutorials';

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

export function extractMarkdownMetadata(content: string): any {
  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';
  
  // Extract description from first paragraph after title
  const lines = content.split('\n');
  let description = '';
  let foundTitle = false;
  
  for (const line of lines) {
    if (line.startsWith('#') && !foundTitle) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && line.trim() && !line.startsWith('#')) {
      description = line.trim();
      break;
    }
  }
  
  return {
    title,
    description: description || 'No description available',
    author: 'AI Builders Team',
    lastUpdated: new Date().toISOString(),
    difficulty: 'beginner',
    tags: []
  };
}

export function extractNotebookMetadata(notebook: any): any {
  // Try to get title from first markdown cell
  let title = 'Untitled Notebook';
  let description = 'Jupyter notebook tutorial';
  
  if (notebook.cells && notebook.cells.length > 0) {
    const firstCell = notebook.cells.find((cell: any) => cell.cell_type === 'markdown');
    if (firstCell && firstCell.source) {
      const source = Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source;
      const titleMatch = source.match(/^#{1,3}\s*\*?\*?(.+?)\*?\*?$/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      
      // Extract description from the content
      const lines = source.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && !line.startsWith('**') && line.length > 20) {
          description = line.trim();
          break;
        }
      }
    }
  }
  
  return {
    title,
    description,
    author: 'AI Builders Team',
    lastUpdated: new Date().toISOString(),
    difficulty: 'beginner',
    tags: ['jupyter', 'tutorial']
  };
}

export function scanTutorialsDirectory(): TutorialSection[] {
  const sections: TutorialSection[] = [];
  
  try {
    const sectionDirs = fs.readdirSync(TUTORIALS_DIR).filter(item => {
      const fullPath = path.join(TUTORIALS_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });
    
    for (const sectionDir of sectionDirs) {
      const sectionPath = path.join(TUTORIALS_DIR, sectionDir);
      const files: TutorialFile[] = [];
      
      const fileNames = fs.readdirSync(sectionPath).filter(file => 
        file.endsWith('.md') || file.endsWith('.ipynb')
      );
      
      for (const fileName of fileNames) {
        const filePath = path.join(sectionPath, fileName);
        const relativePath = `${sectionDir}/${fileName}`;
        
        if (fileName.endsWith('.md')) {
          const content = readMarkdownFile(filePath);
          const metadata = extractMarkdownMetadata(content);
          
          files.push({
            path: relativePath,
            name: fileName,
            type: 'markdown',
            content,
            metadata
          });
        } else if (fileName.endsWith('.ipynb')) {
          const notebook = readNotebookFile(filePath);
          const metadata = extractNotebookMetadata(notebook);
          
          files.push({
            path: relativePath,
            name: fileName,
            type: 'notebook',
            notebook,
            metadata
          });
        }
      }
      
      // Sort files within each section, prioritizing tutorial_overview.md
      files.sort((a, b) => {
        if (a.name === 'tutorial_overview.md') return -1;
        if (b.name === 'tutorial_overview.md') return 1;
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
  
  // Sort sections to put Overview first, then alphabetically
  sections.sort((a, b) => {
    if (a.name === 'Overview') return -1;
    if (b.name === 'Overview') return 1;
    return a.name.localeCompare(b.name);
  });
  
  return sections;
}

export function findTutorialFile(sections: TutorialSection[], targetPath: string): TutorialFile | undefined {
  for (const section of sections) {
    const file = section.files.find(f => {
      const pathWithoutExt = f.path.replace(/\.(md|ipynb)$/, '');
      return pathWithoutExt === targetPath || f.path.includes(targetPath);
    });
    if (file) {
      return file;
    }
  }
  return undefined;
}
