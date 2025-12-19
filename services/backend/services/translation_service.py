"""
Translation Service

Main orchestration service for translation workflow.
Coordinates between Zeabur AI Hub and GitHub storage.
"""

import logging
import json
import asyncio
from typing import List, Dict, Optional
from datetime import datetime

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
            
            # Read source file
            source_content = await self.github.read_file(job.source_file, "en")
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
            
            # Store translated file
            job.status = JobStatus.STORING
            await self.github.write_file(
                job.source_file,
                translated_content,
                job.target_language.value,
                f"Translation: Add {job.target_language.value} version of {job.source_file}\n\n" +
                f"- Model: {job.model_used}\n" +
                f"- Date: {datetime.utcnow().isoformat()}"
            )
            
            # Update metadata
            await self.github.update_translation_metadata(
                job.source_file,
                job.target_language.value,
                source_hash,
                job.model_used,
                MetadataStatus.COMPLETED
            )
            
            # Mark job as completed
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            
            logger.info(f"Job {job.job_id} completed successfully")
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
            metadata = await self.github.load_metadata(lang.value)
            
            if source_file in metadata:
                entry = metadata[source_file]
                available_languages.append(lang)
                translation_status[lang.value] = entry.status
            else:
                translation_status[lang.value] = MetadataStatus.PENDING
        
        return AvailableTranslationsResponse(
            source_file=source_file,
            available_languages=available_languages,
            translation_status=translation_status
        )
    
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
