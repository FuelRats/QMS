from sqlalchemy.engine import make_url

from app.core.config import Settings


def test_database_uri_keeps_a_password_with_url_syntax() -> None:
    password = "p@ss:w/rd#!*?%"
    settings = Settings(
        SERVER_NAME="qms.fuelrats.com",
        SERVER_HOST="https://qms.fuelrats.com",
        PROJECT_NAME="QMS",
        POSTGRES_SERVER="db",
        POSTGRES_USER="postgres",
        POSTGRES_PASSWORD=password,
        POSTGRES_DB="app",
        FIRST_SUPERUSER="admin@qms.fuelrats.com",
        FIRST_SUPERUSER_PASSWORD="unused",
    )
    url = make_url(str(settings.SQLALCHEMY_DATABASE_URI))
    assert url.password == password
    assert url.host == "db"
    assert url.database == "app"
