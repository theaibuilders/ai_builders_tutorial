"""
Translation Service

Main orchestration service for translation workflow.
Coordinates between Zeabur AI Hub and local/GitHub storage.
"""

import logging
import json
import asyncio
import os
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path

from models import (
    TranslationRequest,
    TranslationJob,
    TranslationPriority,
    TranslationStatus,
    JobStatus,
    MetadataStatus,
    LanguageCode,
    TranslationStatusResponse,
    AvailableTranslationsResponse
)
from config import settings
from services.zeabur_service import ZeaburService
from services.github_storage import GitHubStorageManager

logger = logging.getLogger(__name__)

# Path to frontend tutorials directory (relative to backend)
FRONTEND_TUTORIALS_DIR = Path(__file__).parent.parent.parent / 'frontend'

class TranslationService:
    """Main translation service orchestrator"""
    
    def __init__(self):
        """Initialize translation service"""
        self.zeabur = ZeaburService()
        self.github = GitHubStorageManager()
        self.requests: Dict[str, TranslationRequest] = {}
        self.jobs: Dict[str, List[TranslationJob]] = {}
        logger.info("Translation service initialized")
    
    async def create_request(
        self,
        source_files: List[str],
        target_languages: List[LanguageCode],
        priority: TranslationPriority = TranslationPriority.MANUAL
    ) -> TranslationRequest:
        """
        Create a new translation request
        
        Args:
            source_files: List of file paths to translate
            target_languages: List of target language codes
            priority: Request priority (manual or automatic)
            
        Returns:
            TranslationRequest object
        """
        request = TranslationRequest(
            source_files=source_files,
            target_languages=target_languages,
            priority=priority,
            status=TranslationStatus.QUEUED
        )
        
        self.requests[request.request_id] = request
        
        # Create jobs for each file-language combination
        jobs = []
        for source_file in source_files:
            for language in target_languages:
                job = TranslationJob(
                    request_id=request.request_id,
                    source_file=source_file,
                    target_language=language,
                    model_used=settings.TRANSLATION_MODEL,
                    status=JobStatus.PENDING
                )
                jobs.append(job)
        
        self.jobs[request.request_id] = jobs
        
        logger.info(f"Created translation request {request.request_id} with {len(jobs)} jobs")
        return request
    
    async def process_request(self, request_id: str):
        """
        Process a translation request (run in background)
        
        Args:
            request_id: The request ID to process
        """
        request = self.requests.get(request_id)
        if not request:
            logger.error(f"Request {request_id} not found")
            return
        
        jobs = self.jobs.get(request_id, [])
        if not jobs:
            logger.error(f"No jobs found for request {request_id}")
            return
        
        logger.info(f"Processing translation request {request_id} with {len(jobs)} jobs")
        request.status = TranslationStatus.PROCESSING
        
        # Process jobs sequentially (can be parallelized later)
        completed = 0
        failed = 0
        
        for job in jobs:
            try:
                success = await self._process_job(job)
                if success:
                    completed += 1
                else:
                    failed += 1
            except Exception as e:
                logger.error(f"Error processing job {job.job_id}: {str(e)}")
                failed += 1
        
        # Update request status
        if failed == 0:
            request.status = TranslationStatus.COMPLETED
        elif completed > 0:
            request.status = TranslationStatus.COMPLETED  # Partial success
        else:
            request.status = TranslationStatus.FAILED
        
        logger.info(f"Request {request_id} completed: {completed} succeeded, {failed} failed")
    
    async def _process_job(self, job: TranslationJob) -> bool:
        """
        Process a single translation job
        
        Args:
            job: The translation job to process
            
        Returns:
            True if successful, False otherwise
        """
        try:
            job.status = JobStatus.TRANSLATING
            job.started_at = datetime.utcnow()
            
            logger.info(f"Processing job {job.job_id}: {job.source_file} -> {job.target_language}")
            
            # Read source file from local filesystem
            source_content = await self._read_local_source(job.source_file)
            if not source_content:
                raise FileNotFoundError(f"Source file not found: {job.source_file}")
            
            # Calculate source hash
            source_hash = self.github._calculate_hash(source_content)
            
            # Determine file type and translate
            job.status = JobStatus.TRANSLATING
            
            if job.source_file.endswith('.ipynb'):
                # Translate Jupyter notebook
                notebook_data = json.loads(source_content)
                translated_notebook = await self.zeabur.translate_notebook(
                    notebook_data,
                    job.target_language.value
                )
                translated_content = json.dumps(translated_notebook, indent=2, ensure_ascii=False)
            else:
                # Translate MDX/Markdown
                translated_content = await self.zeabur.translate_mdx(
                    source_content,
                    job.target_language.value
                )
            
            # Validate translation
            job.status = JobStatus.VALIDATING
            is_valid = await self._validate_translation(
                source_content,
                translated_content,
                job.source_file
            )
            
            if not is_valid:
                logger.warning(f"Translation validation failed for {job.source_file}")
                # Continue anyway, but log the warning
            
            # Store translated file LOCALLY (not to GitHub)
            job.status = JobStatus.STORING
            await self._save_local_translation(
                job.source_file,
                translated_content,
                job.target_language.value
            )
            
            # Update local metadata
            await self._save_local_metadata(
                job.source_file,
                job.target_language.value,
                source_hash,
                job.model_used
            )
            
            # Mark job as completed
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            
            logger.info(f"Job {job.job_id} completed successfully - saved locally")
            return True
            
        except Exception as e:
            logger.error(f"Job {job.job_id} failed: {str(e)}")
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            
            # Retry logic
            if job.retry_count < settings.TRANSLATION_RETRY_LIMIT:
                job.retry_count += 1
                logger.info(f"Retrying job {job.job_id} (attempt {job.retry_count})")
                await asyncio.sleep(2 ** job.retry_count)  # Exponential backoff
                return await self._process_job(job)
            
            return False
    
    async def _read_local_source(self, file_path: str) -> Optional[str]:
        """
        Read source file from local tutorials directory
        
        Args:
            file_path: Relative path to file (e.g., "Overview/tutorial_overview.mdx")
            
        Returns:
            File content as string, or None if not found
        """
        local_path = FRONTEND_TUTORIALS_DIR / 'tutorials' / file_path
        
        try:
            if local_path.exists():
                return local_path.read_text(encoding='utf-8')
            else:
                logger.error(f"Local source file not found: {local_path}")
                return None
        except Exception as e:
            logger.error(f"Error reading local source file {local_path}: {e}")
            return None
    
    async def _save_local_translation(
        self,
        file_path: str,
        content: str,
        language: str
    ):
        """
        Save translated file to local filesystem
        
        Args:
            file_path: Relative file path
            content: Translated content
            language: Target language code
        """
        # Determine output directory based on language
        output_dir = FRONTEND_TUTORIALS_DIR / f'tutorials-{language}'
        output_path = output_dir / file_path
        
        # Create directory if needed
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write translated file
        output_path.write_text(content, encoding='utf-8')
        
        logger.info(f"Saved translation to: {output_path}")
    
    async def _save_local_metadata(
        self,
        file_path: str,
        language: str,
        source_hash: str,
        model_used: str
    ):
        """
        Save translation metadata to local filesystem
        
        Args:
            file_path: Relative file path
            language: Target language code
            source_hash: Hash of source content
            model_used: Model used for translation
        """
        metadata_dir = FRONTEND_TUTORIALS_DIR / f'tutorials-{language}'
        metadata_path = metadata_dir / 'translation-metadata.json'
        
        # Load existing metadata or create new
        metadata = {}
        if metadata_path.exists():
            try:
                metadata = json.loads(metadata_path.read_text(encoding='utf-8'))
            except json.JSONDecodeError:
                metadata = {}
        
        # Update metadata for this file
        metadata[file_path] = {
            "source_hash": source_hash,
            "model_used": model_used,
            "translated_at": datetime.utcnow().isoformat(),
            "status": "completed"
        }
        
        # Ensure directory exists
        metadata_dir.mkdir(parents=True, exist_ok=True)
        
        # Save metadata
        metadata_path.write_text(
            json.dumps(metadata, indent=2, ensure_ascii=False),
            encoding='utf-8'
        )
        
        logger.info(f"Updated local metadata at: {metadata_path}")
    
    async def _validate_translation(
        self,
        source_content: str,
        translated_content: str,
        file_path: str
    ) -> bool:
        """
        Validate translated content
        
        Args:
            source_content: Original content
            translated_content: Translated content
            file_path: File path (to determine validation rules)
            
        Returns:
            True if validation passes
        """
        try:
            # Basic validations
            if not translated_content or len(translated_content) < 10:
                logger.error("Translation is too short or empty")
                return False
            
            # For notebooks, validate JSON structure
            if file_path.endswith('.ipynb'):
                try:
                    source_nb = json.loads(source_content)
                    translated_nb = json.loads(translated_content)
                    
                    # Check cell count matches
                    if len(source_nb.get('cells', [])) != len(translated_nb.get('cells', [])):
                        logger.error("Cell count mismatch in translated notebook")
                        return False
                    
                    # Check code cells are unchanged
                    for i, (src_cell, trans_cell) in enumerate(zip(
                        source_nb.get('cells', []),
                        translated_nb.get('cells', [])
                    )):
                        if src_cell.get('cell_type') == 'code':
                            src_source = ''.join(src_cell.get('source', []))
                            trans_source = ''.join(trans_cell.get('source', []))
                            if src_source != trans_source:
                                logger.error(f"Code cell {i} was modified during translation")
                                return False
                    
                except json.JSONDecodeError:
                    logger.error("Translated notebook is not valid JSON")
                    return False
            
            # Check for common markdown formatting preservation
            if file_path.endswith(('.md', '.mdx')):
                # Count code blocks
                source_code_blocks = source_content.count('```')
                translated_code_blocks = translated_content.count('```')
                
                if source_code_blocks != translated_code_blocks:
                    logger.warning("Code block count mismatch (may be acceptable)")
                    # Don't fail, just warn
            
            logger.info("Translation validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False
    
    async def get_request_status(self, request_id: str) -> Optional[TranslationStatusResponse]:
        """
        Get status of a translation request
        
        Args:
            request_id: Request ID
            
        Returns:
            TranslationStatusResponse or None if not found
        """
        request = self.requests.get(request_id)
        if not request:
            return None
        
        jobs = self.jobs.get(request_id, [])
        
        completed = sum(1 for job in jobs if job.status == JobStatus.COMPLETED)
        failed = sum(1 for job in jobs if job.status == JobStatus.FAILED)
        
        return TranslationStatusResponse(
            request_id=request_id,
            status=request.status,
            total_jobs=len(jobs),
            completed_jobs=completed,
            failed_jobs=failed,
            created_at=request.created_at,
            updated_at=datetime.utcnow()
        )
    
    async def get_available_translations(self, source_file: str) -> AvailableTranslationsResponse:
        """
        Get available translations for a file
        
        Args:
            source_file: Source file path
            
        Returns:
            AvailableTranslationsResponse with language availability
        """
        available_languages = []
        translation_status = {}
        
        for lang in [LanguageCode.ZH_CN, LanguageCode.JA_JP]:
            # First check local metadata
            local_metadata = self._load_local_metadata(lang.value)
            
            if source_file in local_metadata:
                entry = local_metadata[source_file]
                available_languages.append(lang)
                status = entry.get('status', 'pending')
                translation_status[lang.value] = status if status == 'completed' else 'pending'
            else:
                # Fall back to GitHub metadata
                try:
                    github_metadata = await self.github.load_metadata(lang.value)
                    if source_file in github_metadata:
                        entry = github_metadata[source_file]
                        available_languages.append(lang)
                        translation_status[lang.value] = entry.status
                    else:
                        translation_status[lang.value] = MetadataStatus.PENDING
                except Exception:
                    translation_status[lang.value] = MetadataStatus.PENDING
        
        return AvailableTranslationsResponse(
            source_file=source_file,
            available_languages=available_languages,
            translation_status=translation_status
        )
    
    def _load_local_metadata(self, language: str) -> dict:
        """
        Load translation metadata from local filesystem
        
        Args:
            language: Target language code
            
        Returns:
            Dictionary of translation metadata (file_path -> entry)
        """
        metadata_path = FRONTEND_TUTORIALS_DIR / f'tutorials-{language}' / 'translation-metadata.json'
        
        try:
            if metadata_path.exists():
                data = json.loads(metadata_path.read_text(encoding='utf-8'))
                
                # Merge both structures: entries under 'translations' key AND root-level entries
                result = {}
                
                # Get entries from 'translations' key if it exists
                if 'translations' in data and isinstance(data['translations'], dict):
                    result.update(data['translations'])
                
                # Also check root-level entries (for files saved with new format)
                for key, value in data.items():
                    if key not in ['translations', 'last_updated', 'version'] and isinstance(value, dict):
                        result[key] = value
                
                return result
        except Exception as e:
            logger.error(f"Error loading local metadata for {language}: {e}")
        
        return {}
    
    async def mark_outdated(
        self,
        source_files: List[str],
        target_languages: List[LanguageCode]
    ):
        """
        Mark translations as outdated
        
        Args:
            source_files: List of source file paths
            target_languages: List of target languages
        """
        for lang in target_languages:
            metadata = await self.github.load_metadata(lang.value)
            
            for file_path in source_files:
                if file_path in metadata:
                    metadata[file_path].status = MetadataStatus.OUTDATED
            
            await self.github.save_metadata(lang.value, metadata)
        
        logger.info(f"Marked {len(source_files)} files as outdated for {len(target_languages)} languages")
