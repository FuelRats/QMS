from fastapi import APIRouter, Depends

from app.api.api_v1.endpoints import items, login, users, utils, queue, config
from app.api.deps import reusable_oauth2

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"], dependencies=[Depends(reusable_oauth2)])
api_router.include_router(queue.router, prefix="/queue", tags=["queue"], dependencies=[Depends(reusable_oauth2)])
api_router.include_router(config.router, prefix="/config", tags=["config"], dependencies=[Depends(reusable_oauth2)])
