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
    current_config = db.query(models.config.Config).first()
    return schemas.Config(max_active_clients=current_config.max_active_clients,
                          prioritize_cr=current_config.prioritize_cr,
                          prioritize_non_cr=current_config.prioritize_non_cr,
                          clear_on_restart=current_config.clear_on_restart)


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


@router.put("/max_active_clients", response_model=schemas.Config)
def set_maxclients(
    *,
    db: Session = Depends(deps.get_db),
    max_active_clients: int,
) -> Any:
    """
    Set max clients
    :param max_active_clients: Maximum number of active clients
    """
    current_config = db.query(models.config.Config).first()
    current_config.max_active_clients = max_active_clients
    db.commit()
    db.refresh(current_config)
    print(f"{current_config}")

    return schemas.Config(max_active_clients=current_config.max_active_clients,
                          prioritize_cr=current_config.prioritize_cr,
                          prioritize_non_cr=current_config.prioritize_non_cr,
                          clear_on_restart=current_config.clear_on_restart)

