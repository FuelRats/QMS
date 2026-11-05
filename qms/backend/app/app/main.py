import sentry_sdk
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

from fastapi.security import OAuth2PasswordBearer

if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN))

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        # pydantic's URL type appends "/" to a bare origin; browsers send none
        allow_origins=[
            str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
