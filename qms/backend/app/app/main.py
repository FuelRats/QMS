from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings
from fastapi_security_typeform import SignatureHeader
from fastapi.security import OAuth2PasswordBearer

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)
signature_header_security = SignatureHeader(secret=bytes(settings.TYPEFORM_SECRET, 'utf8'), auto_error=False)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
