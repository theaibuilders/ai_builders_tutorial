"""
GitHub Storage Manager Service

Handles all GitHub operations for storing and retrieving translated content.
Manages separate directories for each language and translation metadata.
"""

import logging
import json
import hashlib
from typing import Optional, Dict, List
from datetime import datetime
import base64
import requests

from config import settings
from models import TranslationMetadataEntry, MetadataStatus, LanguageCode

logger = logging.getLogger(__name__)

class GitHubStorageManager:
    """Manages translated content storage in GitHub repository"""
    
    def __init__(self):
        """Initialize GitHub storage manager"""
        if not settings.GITHUB_TOKEN:
            logger.warning("GITHUB_TOKEN not set - GitHub storage will not work")
            self.enabled = False
        else:
            self.enabled = True
            self.token = settings.GITHUB_TOKEN
            self.owner = settings.GITHUB_REPO_OWNER
            self.repo = settings.GITHUB_REPO_NAME
            self.api_base = f"https://api.github.com/repos/{self.owner}/{self.repo}"
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Accept": "application/vnd.github.v3+json"
            }
            logger.info(f"GitHub storage initialized for {self.owner}/{self.repo}")
    
    def _get_language_dir(self, language: str) -> str:
        """Get the directory name for a specific language"""
        # Base path is services/frontend/tutorials for English
        # Translated versions go to services/frontend/tutorials-{lang}
        lang_dirs = {
            "zh-cn": "services/frontend/tutorials-zh-cn",
            "ja-jp": "services/frontend/tutorials-ja-jp",
            "en": "services/frontend/tutorials"
        }
        return lang_dirs.get(language, f"services/frontend/tutorials-{language}")
    
    def _calculate_hash(self, content: str) -> str:
        """Calculate SHA-256 hash of content"""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    async def read_file(self, file_path: str, language: str = "en") -> Optional[str]:
        """
        Read a file from GitHub repository
        
        Args:
            file_path: Path to file relative to tutorials directory
            language: Language code (determines which directory to read from)
            
        Returns:
            File content as string, or None if file doesn't exist
        """
        if not self.enabled:
            raise ValueError("GitHub storage not configured")
        
        lang_dir = self._get_language_dir(language)
        full_path = f"{lang_dir}/{file_path}"
        
        try:
            url = f"{self.api_base}/contents/{full_path}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 404:
                logger.info(f"File not found: {full_path}")
                return None
            
            response.raise_for_status()
            data = response.json()
            
            # Decode base64 content
            content = base64.b64decode(data['content']).decode('utf-8')
            logger.info(f"Successfully read file: {full_path}")
            
            return content
            
        except Exception as e:
            logger.error(f"Error reading file {full_path}: {str(e)}")
            raise
    
    async def write_file(
        self, 
        file_path: str, 
        content: str, 
        language: str,
        commit_message: Optional[str] = None
    ) -> bool:
        """
        Write a file to GitHub repository
        
        Args:
            file_path: Path to file relative to tutorials directory
            content: File content to write
            language: Target language code
            commit_message: Custom commit message (optional)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            raise ValueError("GitHub storage not configured")
        
        lang_dir = self._get_language_dir(language)
        full_path = f"{lang_dir}/{file_path}"
        
        if not commit_message:
            commit_message = f"Translation: Add {language} version of {file_path}"
        
        try:
            # Check if file already exists (need SHA for update)
            url = f"{self.api_base}/contents/{full_path}"
            check_response = requests.get(url, headers=self.headers)
            
            existing_sha = None
            if check_response.status_code == 200:
                existing_sha = check_response.json().get('sha')
                logger.info(f"File exists, will update: {full_path}")
            
            # Encode content to base64
            content_bytes = content.encode('utf-8')
            content_base64 = base64.b64encode(content_bytes).decode('utf-8')
            
            # Prepare API request
            data = {
                "message": commit_message,
                "content": content_base64,
                "branch": "main"
            }
            
            if existing_sha:
                data["sha"] = existing_sha
            
            # Make API request
            response = requests.put(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            logger.info(f"Successfully wrote file: {full_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error writing file {full_path}: {str(e)}")
            raise
    
    async def create_directory_structure(self, file_path: str, language: str) -> bool:
        """
        Ensure directory structure exists for a file path
        GitHub creates directories automatically when files are created
        
        Args:
            file_path: Path to file (e.g., "Audio/tutorial.ipynb")
            language: Target language code
            
        Returns:
            True (directories are created automatically)
        """
        # GitHub creates directories automatically when creating files
        # No explicit action needed
        logger.info(f"Directory structure will be created automatically for {file_path}")
        return True
    
    async def load_metadata(self, language: str) -> Dict[str, TranslationMetadataEntry]:
        """
        Load translation metadata for a specific language
        
        Args:
            language: Language code
            
        Returns:
            Dictionary of translation metadata entries
        """
        if not self.enabled:
            return {}
        
        try:
            metadata_content = await self.read_file("translation-metadata.json", language)
            
            if not metadata_content:
                logger.info(f"No metadata file found for {language}, creating empty metadata")
                return {}
            
            metadata_dict = json.loads(metadata_content)
            translations = {}
            
            for key, value in metadata_dict.get('translations', {}).items():
                translations[key] = TranslationMetadataEntry(
                    original_path=value['original_path'],
                    translated_path=value['translated_path'],
                    language=value['language'],
                    translation_date=datetime.fromisoformat(value['translation_date'].replace('Z', '+00:00')),
                    source_hash=value['source_hash'],
                    model_used=value['model_used'],
                    status=MetadataStatus(value['status'])
                )
            
            logger.info(f"Loaded {len(translations)} metadata entries for {language}")
            return translations
            
        except Exception as e:
            logger.error(f"Error loading metadata for {language}: {str(e)}")
            return {}
    
    async def save_metadata(self, language: str, translations: Dict[str, TranslationMetadataEntry]) -> bool:
        """
        Save translation metadata for a specific language
        
        Args:
            language: Language code
            translations: Dictionary of translation metadata entries
            
        Returns:
            True if successful
        """
        if not self.enabled:
            raise ValueError("GitHub storage not configured")
        
        try:
            # Convert to JSON-serializable format
            translations_dict = {}
            for key, entry in translations.items():
                translations_dict[key] = {
                    "original_path": entry.original_path,
                    "translated_path": entry.translated_path,
                    "language": entry.language,
                    "translation_date": entry.translation_date.isoformat(),
                    "source_hash": entry.source_hash,
                    "model_used": entry.model_used,
                    "status": entry.status.value
                }
            
            metadata = {
                "translations": translations_dict,
                "last_updated": datetime.utcnow().isoformat(),
                "version": "1.0"
            }
            
            # Write metadata file
            metadata_json = json.dumps(metadata, indent=2, ensure_ascii=False)
            await self.write_file(
                "translation-metadata.json",
                metadata_json,
                language,
                f"Update translation metadata for {language}"
            )
            
            logger.info(f"Saved {len(translations)} metadata entries for {language}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving metadata for {language}: {str(e)}")
            raise
    
    async def update_translation_metadata(
        self,
        file_path: str,
        language: str,
        source_hash: str,
        model_used: str,
        status: MetadataStatus
    ) -> bool:
        """
        Update metadata for a single translation
        
        Args:
            file_path: Original file path
            language: Target language
            source_hash: Hash of source content
            model_used: Model used for translation
            status: Translation status
            
        Returns:
            True if successful
        """
        try:
            # Load existing metadata
            metadata = await self.load_metadata(language)
            
            # Create/update entry
            lang_dir = self._get_language_dir(language)
            entry = TranslationMetadataEntry(
                original_path=file_path,
                translated_path=f"{lang_dir}/{file_path}",
                language=language,
                translation_date=datetime.utcnow(),
                source_hash=source_hash,
                model_used=model_used,
                status=status
            )
            
            metadata[file_path] = entry
            
            # Save updated metadata
            await self.save_metadata(language, metadata)
            
            logger.info(f"Updated metadata for {file_path} ({language})")
            return True
            
        except Exception as e:
            logger.error(f"Error updating translation metadata: {str(e)}")
            raise
    
    async def check_translation_exists(self, file_path: str, language: str) -> bool:
        """
        Check if a translation exists for a file
        
        Args:
            file_path: Original file path
            language: Target language
            
        Returns:
            True if translation exists
        """
        content = await self.read_file(file_path, language)
        return content is not None
    
    async def get_source_file_hash(self, file_path: str) -> str:
        """
        Get hash of source (English) file
        
        Args:
            file_path: File path relative to tutorials directory
            
        Returns:
            SHA-256 hash of file content
        """
        content = await self.read_file(file_path, "en")
        if content is None:
            raise FileNotFoundError(f"Source file not found: {file_path}")
        return self._calculate_hash(content)
