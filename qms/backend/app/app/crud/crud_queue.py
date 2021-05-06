import uuid
from datetime import datetime
from typing import List, Optional, Union, Dict, Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.queue import Queue
from app.models.client import Client
from app.schemas.queue import QueueCreate, QueueUpdate, Queue as queueschema


class CRUDQueue(CRUDBase[Queue, QueueCreate, QueueUpdate]):
    def create(
        self, db: Session, *, obj_in: QueueCreate
    ) -> Queue:
        client_obj = Client(client_name=obj_in.client.client_name,
                            client_system=obj_in.client.client_system,
                            platform=obj_in.client.platform,
                            locale=obj_in.client.locale,
                            o2_status=obj_in.client.o2_status)
        db.add(client_obj)
        db.commit()
        db.refresh(client_obj)
        db_obj = Queue(client=client_obj,
                       arrival_time=datetime.utcnow(),
                       uuid=str(uuid.uuid4()),
                       pending=False)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Queue]:
        res = db.query(self.model, Client).filter(Client.id == self.model.client_id) \
            .order_by(self.model.arrival_time)\
            .offset(skip)\
            .limit(limit)
        queue = []
        for row in res:
            client = {'uuid': row[0].uuid, 'arrival_time': jsonable_encoder(row[0].arrival_time),
                      'pending': row[0].pending, 'client': jsonable_encoder(row[1])}
            queue.append(client)
        return queue

    def update_queue(
        self, db: Session, *, db_obj: Queue, obj_in: Union[QueueUpdate, Dict[str, Any]]
    ) -> Queue:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


queue = CRUDQueue(Queue)
