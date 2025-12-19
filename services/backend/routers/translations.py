from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional
from datetime import datetime
import logging

from models import (
    TranslationRequestCreate,
    TranslationRequest,
    TranslationStatusResponse,
    AvailableTranslationsResponse,
    TranslationConfig,
    LanguageCode,
    MetadataStatus,
    TranslationStatus
)
from services.translation_service import TranslationService
from config import settings

router = APIRouter(prefix="/api/translations", tags=["translations"])
logger = logging.getLogger(__name__)

# Initialize translation service
translation_service = TranslationService()

@router.post("/request", response_model=TranslationRequest)
async def create_translation_request(
    request: TranslationRequestCreate,
    background_tasks: BackgroundTasks
):
    """
    Submit a manual translation request.
    
    - **source_files**: List of tutorial file paths to translate
    - **target_languages**: List of target language codes (zh-cn, ja-jp)
    - **priority**: manual or automatic (default: manual)
    """
    try:
        # Create translation request
        translation_request = await translation_service.create_request(
            source_files=request.source_files,
            target_languages=request.target_languages,
            priority=request.priority
        )
        
        # Process translation in background
        background_tasks.add_task(
            translation_service.process_request,
            translation_request.request_id
        )
        
        logger.info(f"Created translation request: {translation_request.request_id}")
        return translation_request
        
    except Exception as e:
        logger.error(f"Error creating translation request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{request_id}", response_model=TranslationStatusResponse)
async def get_translation_status(request_id: str):
    """
    Check the status of a translation request.
    
    - **request_id**: The unique identifier for the translation request
    """
    try:
        status = await translation_service.get_request_status(request_id)
        if not status:
            raise HTTPException(status_code=404, detail="Translation request not found")
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching translation status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available", response_model=AvailableTranslationsResponse)
async def get_available_translations(
    source_file_path: str = Query(..., description="Path to the source tutorial file")
):
    """
    List all available translations for a specific file.
    
    - **source_file_path**: Path to the source tutorial file (e.g., "Audio/deepgram_tutorial.ipynb")
    """
    try:
        available = await translation_service.get_available_translations(source_file_path)
        return available
        
    except Exception as e:
        logger.error(f"Error fetching available translations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrigger")
async def retrigger_translation(
    request: TranslationRequestCreate,
    background_tasks: BackgroundTasks
):
    """
    Re-translate specific files (useful for updating outdated translations).
    
    - **source_files**: List of tutorial file paths to re-translate
    - **target_languages**: List of target language codes
    """
    try:
        # Mark existing translations as outdated
        await translation_service.mark_outdated(
            source_files=request.source_files,
            target_languages=request.target_languages
        )
        
        # Create new translation request
        translation_request = await translation_service.create_request(
            source_files=request.source_files,
            target_languages=request.target_languages,
            priority=request.priority
        )
        
        # Process in background
        background_tasks.add_task(
            translation_service.process_request,
            translation_request.request_id
        )
        
        logger.info(f"Retriggered translation request: {translation_request.request_id}")
        return translation_request
        
    except Exception as e:
        logger.error(f"Error retriggering translation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config", response_model=TranslationConfig)
async def get_translation_config():
    """
    Retrieve current translation configuration.
    """
    try:
        config = TranslationConfig(
            zeabur_endpoint=settings.ZEABUR_ENDPOINT,
            translation_model=settings.TRANSLATION_MODEL,
            batch_size=settings.TRANSLATION_BATCH_SIZE,
            retry_limit=settings.TRANSLATION_RETRY_LIMIT,
            auto_translate_enabled=settings.AUTO_TRANSLATE_ENABLED
        )
        return config
        
    except Exception as e:
        logger.error(f"Error fetching translation config: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/config", response_model=TranslationConfig)
async def update_translation_config(config: TranslationConfig):
    """
    Update translation configuration (requires admin access in production).
    
    Note: This is a simplified version. In production, add authentication and
    proper config persistence.
    """
    try:
        # In production, this would update environment variables or config file
        # For now, we just return the config to show it's working
        logger.info(f"Translation config update requested: {config.dict()}")
        return config
        
    except Exception as e:
        logger.error(f"Error updating translation config: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
