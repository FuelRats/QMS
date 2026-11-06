import datetime

from app.models import Queue, Statistics, GlobalStatistics
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

from app.db.session import SessionLocal
from app.core.celery_app import celery_app
from app.core.config import settings

if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), integrations=[CeleryIntegration()])


@celery_app.task(acks_late=True)
def test_celery(word: str) -> str:
    return f"test task return {word}"


@celery_app.task(acks_late=True)
def clean_queue(msg: str) -> str:
    db = SessionLocal()
    print("In clear_queue()")
    counter = 0
    timeout = datetime.datetime.now(datetime.UTC) - datetime.timedelta(minutes=15)
    old_queue = db.query(Queue).filter(Queue.pending == True).\
        filter(Queue.arrival_time <= timeout).filter(Queue.in_progress == False)
    for row in old_queue:
        print(f"Timing out queue entry {row.uuid}")
        stat_queue = Statistics(uuid=row.uuid, arrival_time=row.arrival_time, dequeued_at=row.dequeued_at,
                                deleted_at=datetime.datetime.now(datetime.UTC),
                                purged=True)
        db.add(stat_queue)
        counter += 1
        db.delete(row)
        if row.client is not None:
            db.delete(row.client)
    timeout = datetime.datetime.now(datetime.UTC) - datetime.timedelta(minutes=60*24)
    very_old_queue = db.query(Queue).filter(Queue.arrival_time <= timeout)
    for row in very_old_queue:
        print(f"Timing out queue entry {row.uuid}")
        stat_queue = Statistics(uuid=row.uuid, arrival_time=row.arrival_time, dequeued_at=row.dequeued_at,
                                deleted_at=datetime.datetime.now(datetime.UTC),
                                purged=True)
        db.add(stat_queue)
        counter += 1
        db.delete(row)
        if row.client is not None:
            db.delete(row.client)
    db.commit()
    return f"Queue cleaned, {counter} entries removed."


@celery_app.task(acks_late=True)
def generate_stats(msg: str) -> str:
    """
    Receives a rescue JSON as it is deleted to generate stats from it.
    :param msg: A string containing the JSON of the queue entry.
    :return: Calculated statistics entry.
    """
    pass
