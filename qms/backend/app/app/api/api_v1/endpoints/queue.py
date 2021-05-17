from typing import Any, List

from app.models import Client
from fastapi import APIRouter, Depends, HTTPException, Response, status

import datetime
import uuid

from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

from app.models.queue import Queue
from app.models.config import Config
from app.utils import api_query
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound

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
    try:
        row = db.query(Queue).filter(Queue.uuid == uuid).one()
        if not row:
            raise HTTPException(status_code=404, detail="UUID not found")
        item = crud.queue.get(db=db, id=row.id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item
    except NoResultFound:
        raise HTTPException(status_code=404, detail="UUID not found")
    except MultipleResultsFound:
        raise HTTPException(status_code=500, detail="More than one UUID was found! "
                                                    "This should never happen.")


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
    try:

        row = db.query(Queue).filter(Queue.uuid == uuid).one()
        if not row:
            raise HTTPException(status_code=404, detail="UUID not found")
        item = crud.queue.get(db=db, id=row.id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        client = crud.client.update(db=db, db_obj=item.client, obj_in=queue_in.client)
        item = crud.queue.update(db=db, db_obj=item, obj_in=queue_in)

        return item
    except NoResultFound:
        raise HTTPException(status_code=404, detail="UUID not found")
    except MultipleResultsFound:
        raise HTTPException(status_code=500, detail="More than one UUID was found! "
                                                    "This should never happen.")


@router.delete("/uuid/{uuid}", response_model=schemas.Queue)
def remove_queue(
        *,
        db: Session = Depends(deps.get_db),
        uuid: str
) -> Any:
    """
    Delete from queue by UUID
    """
    try:

        row = db.query(Queue).filter(Queue.uuid == uuid).one()
        if not row:
            raise HTTPException(status_code=404, detail="UUID not found")
        item = crud.queue.remove(db=db, id=row.id)
        return item
    except NoResultFound:
        raise HTTPException(status_code=404, detail="UUID not found")
    except MultipleResultsFound:
        raise HTTPException(status_code=500, detail="More than one UUID was found! "
                                                    "This should never happen.")


@router.post("/dequeue", response_model=schemas.Queue)
def api_dequeue(
        *,
        db: Session = Depends(deps.get_db),
) -> Any:
    """
    API convenience endpoint for dequeue.
    """
    row = db.query(Queue).filter(Queue.pending == False).order_by(Queue.arrival_time.asc()).first()
    if not row:
        raise HTTPException(status_code=404, detail="No valid cases to dequeue")
    row.pending = True
    db.commit()
    return row


@router.put("/newclient", response_model=schemas.NewClientNoQueue,
            responses={201: {"model": schemas.NewClient}})
def new_client(
        *,
        db: Session = Depends(deps.get_db),
        client_in: schemas.QueueCreate,
        response: Response
) -> Any:
    """
    Announce a new client to the QMS, return queueing info if chat is full
    """
    maxclients = db.query(Config).first().max_active_clients
    clients = api_query("rescues", "status", "open")['meta']['total']

    uid = uuid.uuid4()
    if clients > maxclients or maxclients == 0:
        # Queue and return.
        response.status_code = status.HTTP_201_CREATED
        queue = crud.queue.create(db, obj_in=client_in)
        res = {'message': 'queued', 'uuid': queue.uuid, 'arrival_time': queue.arrival_time,
               'pending': queue.pending, 'client': queue.client}
        return res
    else:
        return {'message': 'go_ahead', 'uuid': str(uid), 'arrival_time': datetime.datetime.utcnow().isoformat(),
                'client': client_in.client}
