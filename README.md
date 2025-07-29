# AI Builders Tutorial

A comprehensive tutorial platform built with Astro, inspired by the OpenAI Tutorial design. This platform hosts AI development tutorials, primarily as Jupyter Notebooks and Markdown files, with a focus on creating an excellent developer experience.

## 🚀 Features

- **Three-Column Layout**: Left sidebar navigation, main content area, and right sidebar table of contents
- **Dark/Light Theme**: Default dark theme with the ability to toggle between themes
- **Interactive Notebooks**: Full support for rendering Jupyter Notebooks with syntax highlighting
- **Search Functionality**: Real-time search across all tutorials and content
- **Responsive Design**: Optimized for desktop and mobile devices
- **GitHub Integration**: Fetch content directly from GitHub repositories
- **Copy-to-Clipboard**: Easy code copying from notebooks and examples
- **TypeScript Support**: Fully typed codebase for better development experience

## 🎨 Design

The design is heavily inspired by the OpenAI Tutorial interface, featuring:

- **Dark Theme Colors**:
  - Background: `#1f2123`
  - Text: `#f8fafc`
  - Secondary text: `#a7a9ac`
  - Borders: `#374151`

- **Clean, Modern Aesthetic**: Minimalist design focused on readability and developer experience
- **Hierarchical Navigation**: Collapsible tree structure based on repository folder organization
- **Syntax Highlighting**: Beautiful code highlighting using Shiki

## 🛠️ Technology Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **UI Components**: Astro components with interactive islands
- **Syntax Highlighting**: [Shiki](https://github.com/shikijs/shiki)
- **Fonts**: Inter (sans-serif) and Fira Code (monospace)

## 📁 Project Structure

```
src/
├── components/           # Astro components
│   ├── LeftSidebar.astro      # Navigation sidebar
│   ├── MainContent.astro      # Tutorial content display
│   ├── RightSidebar.astro     # Table of contents
│   └── SearchBar.astro        # Search functionality
├── layouts/
│   └── TutorialLayout.astro   # Main layout template
├── pages/
│   ├── index.astro           # Homepage
│   └── tutorials/
│       └── [...slug].astro   # Dynamic tutorial pages
├── types/
│   └── tutorial.ts           # TypeScript type definitions
├── utils/
│   ├── github.ts            # GitHub API integration
│   └── notebook.ts          # Jupyter notebook rendering
└── islands/                 # Interactive components (unused in current implementation)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai_builders_tutorial
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4321`

### Configuration

#### GitHub Integration

To fetch content from GitHub, update the configuration in `src/utils/github.ts`:

```typescript
const REPO_OWNER = 'your-github-username';
const REPO_NAME = 'your-repository-name';
const TUTORIALS_PATH = 'tutorials'; // Path to tutorials in your repo
```

#### Content Structure

Organize your tutorials in the following structure in your GitHub repository:

```
tutorials/
├── getting-started/
│   ├── 01-introduction.md
│   └── 02-setup.ipynb
├── langchain-basics/
│   ├── 01-prompts-and-parsers.ipynb
│   └── 02-building-chains.ipynb
└── advanced-rag/
    └── 01-multi-query-retriever.ipynb
```

## 📝 Content Format

### Markdown Files

Markdown files support frontmatter for metadata:

```markdown
---
title: "Getting Started with LangChain"
author: "AI Builders Team"
description: "Introduction to LangChain framework"
difficulty: "beginner"
tags: ["langchain", "introduction"]
---

# Getting Started with LangChain

Your content here...
```

### Jupyter Notebooks

Jupyter notebooks are automatically parsed and rendered with:
- Syntax highlighting for code cells
- Proper rendering of markdown cells
- Output display for executed cells
- Copy-to-clipboard functionality for code

## 🎯 Key Components

### LeftSidebar.astro
- Hierarchical navigation tree
- Search functionality
- Theme toggle
- Collapsible sections

### MainContent.astro
- Tutorial content rendering
- Jupyter notebook support
- Metadata display
- Copy buttons for code

### RightSidebar.astro
- Table of contents generation
- Active section highlighting
- Smooth scrolling navigation

## 🔧 Customization

### Theme Colors

Update colors in `tailwind.config.mjs`:

```javascript
colors: {
  dark: {
    bg: '#1f2123',      // Background color
    text: '#f8fafc',    // Primary text
    secondary: '#a7a9ac', // Secondary text
    // ... more colors
  }
}
```

### Fonts

Fonts are loaded from Google Fonts in the layout. Update the font imports in `TutorialLayout.astro` to change typography.

### Layout

The three-column layout can be customized by modifying the grid classes in `TutorialLayout.astro`.

## 📦 Building for Production

1. Build the project:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from [OpenAI Tutorial](https://platform.openai.com/docs/tutorials)
- Built with [Astro](https://astro.build/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Syntax highlighting by [Shiki](https://github.com/shikijs/shiki)

## 📞 Support

For questions and support, please contact the AI Builders Singapore community or open an issue in this repository.

---

Built with ❤️ by the AI Builders Singapore community
