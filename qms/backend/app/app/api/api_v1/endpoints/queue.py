from typing import Any, List, Union

from fastapi import APIRouter, Body, Depends, HTTPException, Response, status
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr

import datetime
import uuid

from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.utils import send_new_account_email
from app.models.queue import Queue
from app.models.config import Config
from app.utils import api_query

router = APIRouter()


@router.get("/")
def get_queue(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100
) -> Any:
    """
    Get the current queue
    """
    print("In get_queue")
    print(api_query("rescues", "status", "open"))
    queue = crud.queue.get_multi(db, skip=skip, limit=limit)
    return queue


@router.get("/", response_model=List[schemas.Queue])
def read_queue(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve queue.
    """
    print("In read_queue")
    print(api_query("rescues", "status", "open"))
    queue = crud.queue.get_multi(db, skip=skip, limit=limit)
    return queue

@router.get("/uuid/{uuid}", response_model=schemas.Queue)
def get_queue_by_uuid(
    *,
    db: Session = Depends(deps.get_db),
    uuid: str,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve specific queued client by its UUID
    """

    return None

@router.put("/uuid/{uuid}", response_model=schemas.Queue)
def update_queue(
        *,
        db: Session = Depends(deps.get_db),
        uuid: str,
        queue_in: schemas.QueueUpdate,

) -> Any:
    """
    Update queue information.
    Accepts changes to pending or uuid fields.
    """
    row = db.query(Queue).filter(Queue.uuid==uuid).one()
    if not row:
        raise HTTPException(status_code=404, detail="UUID not found")
    item = crud.queue.get(db=db, id=row.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item = crud.queue.update(db=db, db_obj=item, obj_in=queue_in)
    return item

@router.delete("/uuid/{uuid}", response_model=schemas.Queue)
def remove_queue(
        *,
        db: Session = Depends(deps.get_db),
        uuid: str
) -> Any:
    """
    Delete from queue by UUID
    """
    row = db.query(Queue).filter(Queue.uuid==uuid).one()
    if not row:
        raise HTTPException(status_code=404, detail="UUID not found")
    item = crud.queue.remove(db=db, id=row.id)
    return item


@router.delete("/dequeue/{uuid}", response_model=schemas.Queue)
def api_dequeue(
        *,
        db: Session = Depends(deps.get_db),
        uuid: str
) -> Any:
    """
    API convenience endpoint for dequeue.
    """
    row = db.query(Queue).filter(Queue.uuid==uuid).one()
    if not row:
        raise HTTPException(status_code=404, detail="UUID not found")
    item = crud.queue.remove(db=db, id=row.id)
    return item


@router.put("/newclient", response_model=schemas.NewClientNoQueue,
            responses={201: {"model": schemas.NewClient}})
def new_client(
        *,
        db: Session = Depends(deps.get_db),
        client_in: schemas.QueueCreate,
        response: Response
)-> Any:
    """
    Announce a new client to the QMS, return queueing info if chat is full
    """
    maxclients = db.query(Config).first().max_active_clients
    print(api_query("rescues", "status", "open"))
    # Query API to get current client load.
    clients = 8
    if clients > maxclients:
        # Queue and return.
        response.status_code = status.HTTP_201_CREATED
        uid = uuid.uuid4()
        return {'message': 'queued', 'arrival_time': datetime.datetime.utcnow().isoformat(), 'uuid': str(uid), 'client': client_in.client}
    else:
        return {'message': 'go_ahead', 'uuid': str(uid), 'arrival_time': datetime.datetime.utcnow().isoformat(), 'client': client_in.client}
