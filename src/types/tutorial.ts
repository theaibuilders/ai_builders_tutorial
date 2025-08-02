// TypeScript types for the tutorial system

export interface JupyterCell {
  cell_type: 'code' | 'markdown' | 'raw';
  execution_count?: number | null;
  metadata: Record<string, any>;
  outputs?: JupyterOutput[];
  source: string[];
}

export interface JupyterOutput {
  output_type: 'stream' | 'display_data' | 'execute_result' | 'error';
  name?: string;
  text?: string[];
  data?: {
    'text/plain'?: string[];
    'text/html'?: string[];
    'image/png'?: string;
    'image/jpeg'?: string;
    'application/json'?: any;
  };
  metadata?: Record<string, any>;
  execution_count?: number;
  traceback?: string[];
  ename?: string;
  evalue?: string;
}

export interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: {
    kernelspec?: {
      display_name: string;
      language: string;
      name: string;
    };
    language_info?: {
      name: string;
      version: string;
      mimetype?: string;
      file_extension?: string;
    };
  };
  nbformat: number;
  nbformat_minor: number;
}

export interface TutorialMetadata {
  title: string;
  description?: string;
  author?: string;
  authorPicture?: string;
  authorUrl?: string;
  authorId?: string;
  lastUpdated: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthorMetadata {
  name: string;
  picture?: string;
  url?: string;
  bio?: string;
}

export interface TutorialFile {
  path: string;
  name: string;
  type: 'notebook' | 'markdown';
  content?: string;
  notebook?: JupyterNotebook;
  metadata: TutorialMetadata;
}

export interface TutorialSection {
  name: string;
  path: string;
  files: TutorialFile[];
  subsections?: TutorialSection[];
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubFile[];
  truncated: boolean;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface SearchResult {
  file: TutorialFile;
  section: string;
  relevance: number;
}
