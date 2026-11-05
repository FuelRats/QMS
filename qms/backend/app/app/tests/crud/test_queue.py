from sqlalchemy.orm import Session

from app import crud
from app.schemas.client import Client, GameMode
from app.schemas.queue import QueueCreate
from app.tests.utils.utils import random_lower_string


def create_queued_client(db: Session, game_mode: GameMode):
    client_in = Client(
        client_name=random_lower_string(),
        client_system="Fuelum",
        platform="pc",
        locale="en",
        o2_status=False,
        odyssey=game_mode,
    )
    return crud.queue.create(db=db, obj_in=QueueCreate(client=client_in))


def test_create_queue_stores_game_mode(db: Session) -> None:
    for game_mode in GameMode:
        queued = create_queued_client(db, game_mode)
        assert queued.client.odyssey == game_mode.value


def test_get_multi_returns_game_mode(db: Session) -> None:
    queued = create_queued_client(db, GameMode.horizons4)
    rows = crud.queue.get_multi(db, limit=100000)
    row = next(row for row in rows if row["uuid"] == queued.uuid)
    assert row["client"]["odyssey"] == "horizons4"
