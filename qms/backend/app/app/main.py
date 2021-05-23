import datetime

from fastapi import FastAPI, Depends
from fastapi_utils.tasks import repeat_every
from starlette.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.api import deps
from app.models.queue import Queue

from fastapi.security import OAuth2PasswordBearer

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token")


@app.on_event("startup")
@repeat_every(seconds=60)
def cleanup_old_queue() -> None:
    db = Depends(deps.get_db)
    timeout = datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
    old_queue = db.query(Queue).filter(Queue.pending == True).\
        filter(Queue.arrival_time <= timeout).filter(Queue.in_progress == False)
    for row in old_queue:
        print(f"Timing out queue entry {row.uuid}")
        row.delete()
    db.commit()


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
