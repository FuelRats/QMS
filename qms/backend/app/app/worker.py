import datetime

from app.models import Queue
from raven import Client

from app.db.session import SessionLocal
from app.core.celery_app import celery_app
from app.core.config import settings

client_sentry = Client(settings.SENTRY_DSN)


@celery_app.task(acks_late=True)
def test_celery(word: str) -> str:
    return f"test task return {word}"


@celery_app.task(acks_late=True)
def clean_queue(msg: str) -> str:
    db = SessionLocal()
    print("In clear_queue()")
    timeout = datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
    old_queue = db.query(Queue).filter(Queue.pending == True).\
        filter(Queue.arrival_time <= timeout).filter(Queue.in_progress == False)
    for row in old_queue:
        print(f"Timing out queue entry {row.uuid}")
        row.delete()
    db.commit()
    return "Queue cleaned."
