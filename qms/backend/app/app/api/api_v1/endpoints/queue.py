import datetime
import statistics
from typing import Any, List, Union, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound

from app import crud, schemas
from app.api import deps
from app.core.celery_app import celery_app
from app.models import Client, Statistics, Queue, Config
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
    queue = crud.queue.get_multi(db, skip=skip, limit=limit)
    return queue


@router.get("/uuid/{uuid}", response_model=schemas.Queue)
def get_queue_by_uuid(
        *,
        db: Session = Depends(deps.get_db),
        uuid: str,
) -> Any:
    """
    Retrieve specific queued client by its UUID
    """
    try:
        row = db.query(Queue).filter(func.lower(Queue.uuid) == uuid.lower()).one()
        if not row:
            raise HTTPException(status_code=404, detail="UUID not found")
        item = crud.queue.get(db=db, id=row.id)
        if not item:
            raise HTTPException(status_code=404, detail="UUID found, but no matching queue data")
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

        row = db.query(Queue).filter(func.lower(Queue.uuid) == uuid.lower()).one()
        if not row:
            raise HTTPException(status_code=404, detail="UUID not found")
        item = crud.queue.get(db=db, id=row.id)
        if not item:
            raise HTTPException(status_code=404, detail="UUID found, but no matching queue data")
        if queue_in.pending == True and item.pending == False:
            item.dequeued_at = datetime.datetime.utcnow()
        item = crud.queue.update(db=db, db_obj=item, obj_in=queue_in)
        client = crud.client.update(db=db, db_obj=item.client, obj_in=queue_in.client)
        db.refresh(item)
        db.refresh(client)
        return item
    except NoResultFound:
        raise HTTPException(status_code=404, detail="UUID not found")
    except MultipleResultsFound:
        raise HTTPException(status_code=500, detail="More than one UUID was found! "
                                                    "This should never happen.")


@router.delete("/uuid/{uuid}")
def remove_queue(
        *,
        db: Session = Depends(deps.get_db),
        uuid: str
) -> Any:
    """
    Delete from queue by UUID
    """
    try:

        row = db.query(Queue).filter(func.lower(Queue.uuid) == uuid.lower()).one()
        if not row:
            raise HTTPException(status_code=404, detail="UUID not found")
        client = db.query(Client).filter(Client.id == row.client.id).one()
        stat_queue = Statistics(uuid=row.uuid, arrival_time=row.arrival_time, dequeued_at=row.dequeued_at,
                                deleted_at=datetime.datetime.utcnow(), purged=False)
        db.add(stat_queue)
        db.commit()
        crud.client.remove(db=db, id=client.id)
        crud.queue.remove(db=db, id=row.id)
        old_queue = db.query(Queue).filter(Queue.arrival_time <=
                                           (datetime.datetime.utcnow()-datetime.timedelta(hours=24)))
        if old_queue.count() >= 1:
            celery_app.send_task("app.worker.clean_queue", args=["Cleanup started by stale cases."])
        return {'status': f'Success!'}
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
        raise HTTPException(status_code=204, detail="No valid cases to dequeue")
    row.pending = True
    row.dequeued_at = datetime.datetime.utcnow()
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
    print(f"Got API query result: {clients}")
    try:
        cur_queue = db.query(Queue).filter(Queue.client.has(Client.client_name == client_in.client.client_name)).one()
        if cur_queue:
            if cur_queue.pending:
                res = {'message': 'go_ahead', 'uuid': cur_queue.uuid, 'arrival_time': cur_queue.arrival_time,
                       'client': cur_queue.client}
            else:
                res = {'message': 'queued', 'uuid': cur_queue.uuid, 'arrival_time': cur_queue.arrival_time,
                       'client': cur_queue.client}
            return res
    except NoResultFound:
        pass
    except MultipleResultsFound:
        raise HTTPException(status_code=500, detail="More than one UUID was found for this client! "
                                                    "This should never happen.")
    if clients >= maxclients or maxclients == 0:
        # Queue and return.
        response.status_code = status.HTTP_201_CREATED
        queue = crud.queue.create(db, obj_in=client_in)
        res = {'message': 'queued', 'uuid': queue.uuid, 'arrival_time': queue.arrival_time,
               'pending': queue.pending, 'client': queue.client}
        return res
    else:
        queue = crud.queue.create(db, obj_in=client_in)
        queue.pending = True
        queue.dequeued_at = datetime.datetime.utcnow()
        db.commit()
        res = {'message': 'go_ahead', 'uuid': queue.uuid, 'arrival_time': queue.arrival_time,
               'client': queue.client}
        return res


@router.post("/clean_queue/", response_model=schemas.Msg, status_code=200)
def clean_queue(
        msg: schemas.Msg
) -> Any:
    """
    Clean queue of stale entries
    """
    task = celery_app.send_task("app.worker.clean_queue", args=[msg.msg])
    return {"msg": f"Queue cleanup initiated as task {task.id}."}


@router.post("/statistics/", response_model=Union[schemas.Statistics, List[schemas.StatisticsEntry]], status_code=200)
def get_statistics(
        *,
        db: Session = Depends(deps.get_db),
        daterequested: datetime.date,
        enddate: Optional[datetime.date] = None,
        detailed: bool,
        response: Response
) -> Any:
    print(f"Date requested: {daterequested} Detailed: {detailed}")
    start = datetime.datetime.strptime(f"{daterequested} 00:00:00", '%Y-%m-%d %H:%M:%S')
    if enddate:
        end = datetime.datetime.strptime(f"{enddate} 23:59:59", '%Y-%m-%d %H:%M:%S')
    else:
        end = datetime.datetime.strptime(f"{daterequested} 23:59:59", '%Y-%m-%d %H:%M:%S')
    print(f"Start: {start} End: {end}")
    stats = db.query(Statistics).filter(Statistics.arrival_time.between(start, end))
    detail_view = []
    avg_queue_times = []
    avg_rescue_times = []
    max_queue_time = 0
    max_rescue_time = 0
    instants = 0
    loiterers = 0
    lost_queues = 0
    for row in stats:
        if detailed:
            deet = schemas.StatisticsEntry(uuid=row.uuid, arrival_time=row.arrival_time,
                                           dequeued_at=row.dequeued_at, deleted_at=row.deleted_at,
                                           purged=row.purged)
            detail_view.append(deet)
        else:
            if row.dequeued_at:
                queued_time = (row.dequeued_at - row.arrival_time).total_seconds()
                avg_queue_times.append(queued_time)
                if queued_time > max_queue_time:
                    max_queue_time = queued_time
                if queued_time < 10:
                    instants += 1
                else:
                    if row.purged:
                        lost_queues += 1
                    else:
                        loiterers += 1
            if row.deleted_at:
                rescue_time = (row.deleted_at - row.arrival_time).total_seconds()
                avg_rescue_times.append(rescue_time)
                if rescue_time > max_rescue_time:
                    max_rescue_time = rescue_time
    if not detailed:
        try:
            queue_time = statistics.mean(avg_queue_times)
        except statistics.StatisticsError:
            print("Unable to calculate a mean time for queueing, no entries!")
            queue_time = -1
        try:
            rescue_time = statistics.mean(avg_rescue_times)
        except statistics.StatisticsError:
            print("Unable to calculate a mean time for rescue time, no entries!")
            rescue_time = -1
        return schemas.Statistics(total_clients=(instants + loiterers + lost_queues),
                                  instant_join=instants, queued_join=loiterers,
                                  average_queuetime=queue_time, average_rescuetime=rescue_time,
                                  longest_rescuetime=max_rescue_time, longest_queuetime=max_queue_time,
                                  lost_queues=lost_queues, successful_queues=loiterers)
    else:
        return detail_view
