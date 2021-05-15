from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.models.config import Config

router = APIRouter()


@router.get("/", response_model=schemas.Config)
def get_config(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100
) -> Any:
    """
    Get the current configuration settings
    """
    print("In get_config")
    config = crud.config.get_config(db, skip=skip, limit=limit)
    pass


@router.put("/", response_model=schemas.Config)
def set_config(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Sets configuration options.
    """

    pass
