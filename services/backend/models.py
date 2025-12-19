from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    credential: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class User(BaseModel):
    id: int
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# Translation Models

class LanguageCode(str, Enum):
    EN = "en"
    ZH_CN = "zh-cn"
    JA_JP = "ja-jp"

class TranslationPriority(str, Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"

class TranslationStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class JobStatus(str, Enum):
    PENDING = "pending"
    TRANSLATING = "translating"
    VALIDATING = "validating"
    STORING = "storing"
    COMPLETED = "completed"
    FAILED = "failed"

class MetadataStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    FAILED = "failed"
    OUTDATED = "outdated"

class TranslationRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_files: List[str]
    target_languages: List[LanguageCode]
    priority: TranslationPriority = TranslationPriority.AUTOMATIC
    requester: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: TranslationStatus = TranslationStatus.QUEUED

class TranslationJob(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    source_file: str
    target_language: LanguageCode
    model_used: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: JobStatus = JobStatus.PENDING
    error_message: Optional[str] = None
    retry_count: int = 0

class TranslationMetadataEntry(BaseModel):
    original_path: str
    translated_path: str
    language: str
    translation_date: datetime
    source_hash: str
    model_used: str
    status: MetadataStatus

class TranslationMetadata(BaseModel):
    translations: dict[str, TranslationMetadataEntry]
    last_updated: datetime
    version: str = "1.0"

class TranslationRequestCreate(BaseModel):
    source_files: List[str]
    target_languages: List[LanguageCode]
    priority: TranslationPriority = TranslationPriority.MANUAL

class TranslationStatusResponse(BaseModel):
    request_id: str
    status: TranslationStatus
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    created_at: datetime
    updated_at: datetime

class AvailableTranslationsResponse(BaseModel):
    source_file: str
    available_languages: List[LanguageCode]
    translation_status: dict[str, MetadataStatus]

class TranslationConfig(BaseModel):
    zeabur_endpoint: str
    translation_model: str
    batch_size: int
    retry_limit: int
    auto_translate_enabled: bool
