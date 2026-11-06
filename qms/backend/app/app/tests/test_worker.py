from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app import crud
from app.models import Client, Queue, Statistics
from app.schemas.client import Client as ClientIn
from app.schemas.client import GameMode
from app.schemas.queue import QueueCreate
from app.tests.utils.utils import random_lower_string
from app.worker import clean_queue


def create_queued_client(
    db: Session, age: timedelta, pending: bool, in_progress: bool
) -> Queue:
    client_in = ClientIn(
        client_name=random_lower_string(),
        client_system="Fuelum",
        platform="pc",
        locale="en",
        o2_status=False,
        odyssey=GameMode.odyssey,
    )
    queued = crud.queue.create(db=db, obj_in=QueueCreate(client=client_in))
    queued.arrival_time = datetime.now(UTC) - age
    queued.pending = pending
    queued.in_progress = in_progress
    db.commit()
    return queued


def test_clean_queue_removes_the_clients_of_purged_entries(db: Session) -> None:
    timed_out = create_queued_client(
        db, timedelta(minutes=20), pending=True, in_progress=False
    )
    stale = create_queued_client(db, timedelta(days=2), pending=True, in_progress=True)
    purged = [(entry.uuid, entry.client_id) for entry in (timed_out, stale)]

    clean_queue("test")

    db.expire_all()
    for uuid, client_id in purged:
        assert db.query(Queue).filter(Queue.uuid == uuid).count() == 0
        assert db.get(Client, client_id) is None
        assert (
            db.query(Statistics)
            .filter(Statistics.uuid == uuid, Statistics.purged.is_(True))
            .count()
            == 1
        )


def test_clean_queue_keeps_recent_entries_and_their_clients(db: Session) -> None:
    recent = create_queued_client(
        db, timedelta(minutes=5), pending=True, in_progress=False
    )

    clean_queue("test")

    db.expire_all()
    assert db.query(Queue).filter(Queue.uuid == recent.uuid).count() == 1
    assert db.get(Client, recent.client_id) is not None
