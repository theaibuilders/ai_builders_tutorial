"""
Zeabur AI Hub Integration Service

This service handles translation requests using Zeabur AI Hub's unified API.
Supports multiple models through OpenAI-compatible interface.
"""

import logging
from typing import Optional
from openai import OpenAI
from config import settings

logger = logging.getLogger(__name__)

class ZeaburService:
    """Service for interacting with Zeabur AI Hub API"""
    
    ENDPOINTS = {
        "tokyo": "https://hnd1.aihub.zeabur.ai/",
        "san_francisco": "https://sfo1.aihub.zeabur.ai/"
    }
    
    # Translation prompts for different content types
    MDX_TRANSLATION_PROMPT = """You are a professional technical translator specializing in AI and software development content.

Translate the following tutorial content to {target_language}.

CRITICAL RULES:
1. Preserve ALL markdown formatting (###, **, `, ```, etc.)
2. Keep ALL code blocks COMPLETELY UNCHANGED - do not translate code
3. Keep ALL URLs, links, and file paths UNCHANGED
4. Translate only natural language text (paragraphs, headings, list items)
5. Preserve frontmatter structure but translate string values
6. Maintain heading hierarchy and formatting
7. Keep technical terms in English when they are industry-standard (e.g., API, JSON, SDK)
8. For code comments within code blocks: DO NOT translate them, keep original

Target Language: {target_language_name}

Source Content:
{content}

Provide ONLY the translated content, maintaining exact formatting."""

    IPYNB_TRANSLATION_PROMPT = """You are a professional technical translator specializing in AI and software development content.

Translate the following Jupyter notebook markdown cell to {target_language}.

CRITICAL RULES:
1. This is a MARKDOWN CELL from a Jupyter notebook
2. Translate ONLY the natural language text
3. Keep ALL code examples, variable names, and technical syntax UNCHANGED
4. Preserve ALL markdown formatting
5. Keep technical terms in English when appropriate
6. Maintain the exact structure and formatting

Target Language: {target_language_name}

Markdown Cell Content:
{content}

Provide ONLY the translated markdown content, maintaining exact formatting."""

    LANGUAGE_NAMES = {
        "zh-cn": "Simplified Chinese (简体中文)",
        "ja-jp": "Japanese (日本語)"
    }
    
    def __init__(self):
        """Initialize Zeabur service with API configuration"""
        self.use_openai_direct = False
        
        # Try Zeabur first, fall back to OpenAI direct
        if settings.ZEABUR_API_KEY:
            endpoint = self.ENDPOINTS.get(settings.ZEABUR_ENDPOINT, self.ENDPOINTS["tokyo"])
            self.client = OpenAI(
                base_url=endpoint,
                api_key=settings.ZEABUR_API_KEY
            )
            logger.info(f"Zeabur service initialized with endpoint: {settings.ZEABUR_ENDPOINT}")
        elif settings.OPENAI_API_KEY:
            # Use OpenAI directly as fallback
            self.client = OpenAI(
                api_key=settings.OPENAI_API_KEY
            )
            self.use_openai_direct = True
            logger.info("Using OpenAI API directly (fallback mode)")
        else:
            logger.warning("No API key configured - translation service will not work")
            self.client = None
    
    async def translate_mdx(self, content: str, target_language: str) -> str:
        """
        Translate MDX (Markdown) content to target language
        
        Args:
            content: The MDX content to translate
            target_language: Target language code (e.g., 'zh-cn', 'ja-jp')
            
        Returns:
            Translated MDX content with formatting preserved
        """
        if not self.client:
            raise ValueError("Zeabur API key not configured")
        
        language_name = self.LANGUAGE_NAMES.get(target_language, target_language)
        
        prompt = self.MDX_TRANSLATION_PROMPT.format(
            target_language=target_language,
            target_language_name=language_name,
            content=content
        )
        
        try:
            logger.info(f"Translating MDX content to {target_language} ({len(content)} chars)")
            
            response = self.client.chat.completions.create(
                model=settings.TRANSLATION_MODEL,
                messages=[
                    {"role": "system", "content": "You are a professional technical translator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.3  # Lower temperature for more consistent translations
            )
            
            translated_content = response.choices[0].message.content
            logger.info(f"MDX translation completed ({len(translated_content)} chars)")
            
            return translated_content
            
        except Exception as e:
            logger.error(f"Error translating MDX content: {str(e)}")
            raise
    
    async def translate_notebook_cell(self, cell_content: str, target_language: str) -> str:
        """
        Translate a Jupyter notebook markdown cell to target language
        
        Args:
            cell_content: The markdown cell content to translate
            target_language: Target language code (e.g., 'zh-cn', 'ja-jp')
            
        Returns:
            Translated cell content with formatting preserved
        """
        if not self.client:
            raise ValueError("Zeabur API key not configured")
        
        language_name = self.LANGUAGE_NAMES.get(target_language, target_language)
        
        prompt = self.IPYNB_TRANSLATION_PROMPT.format(
            target_language=target_language,
            target_language_name=language_name,
            content=cell_content
        )
        
        try:
            logger.debug(f"Translating notebook cell to {target_language} ({len(cell_content)} chars)")
            
            response = self.client.chat.completions.create(
                model=settings.TRANSLATION_MODEL,
                messages=[
                    {"role": "system", "content": "You are a professional technical translator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            translated_content = response.choices[0].message.content
            logger.debug(f"Notebook cell translation completed ({len(translated_content)} chars)")
            
            return translated_content
            
        except Exception as e:
            logger.error(f"Error translating notebook cell: {str(e)}")
            raise
    
    async def translate_notebook(self, notebook_data: dict, target_language: str) -> dict:
        """
        Translate an entire Jupyter notebook to target language
        
        Args:
            notebook_data: The notebook JSON data
            target_language: Target language code (e.g., 'zh-cn', 'ja-jp')
            
        Returns:
            Translated notebook data with code cells preserved
        """
        if not self.client:
            raise ValueError("Zeabur API key not configured")
        
        try:
            logger.info(f"Translating notebook with {len(notebook_data.get('cells', []))} cells")
            
            # Create a copy of the notebook
            translated_notebook = notebook_data.copy()
            translated_cells = []
            
            for cell in notebook_data.get('cells', []):
                cell_copy = cell.copy()
                
                # Only translate markdown cells
                if cell.get('cell_type') == 'markdown':
                    source = cell.get('source', [])
                    if isinstance(source, list):
                        source_text = ''.join(source)
                    else:
                        source_text = source
                    
                    # Skip empty cells
                    if not source_text.strip():
                        translated_cells.append(cell_copy)
                        continue
                    
                    # Translate the cell content
                    translated_text = await self.translate_notebook_cell(source_text, target_language)
                    
                    # Update the cell source
                    if isinstance(source, list):
                        # Keep as list of lines
                        cell_copy['source'] = [line + '\n' for line in translated_text.split('\n')]
                        # Remove trailing newline from last line
                        if cell_copy['source']:
                            cell_copy['source'][-1] = cell_copy['source'][-1].rstrip('\n')
                    else:
                        cell_copy['source'] = translated_text
                
                # Keep code cells and output cells unchanged
                translated_cells.append(cell_copy)
            
            translated_notebook['cells'] = translated_cells
            logger.info(f"Notebook translation completed")
            
            return translated_notebook
            
        except Exception as e:
            logger.error(f"Error translating notebook: {str(e)}")
            raise
    
    def test_connection(self) -> bool:
        """Test the connection to Zeabur AI Hub"""
        if not self.client:
            return False
        
        try:
            response = self.client.chat.completions.create(
                model=settings.TRANSLATION_MODEL,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            return True
        except Exception as e:
            logger.error(f"Zeabur connection test failed: {str(e)}")
            return False
