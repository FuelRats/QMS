FROM python:3.12-slim

WORKDIR /app/

# Install Poetry
RUN pip install --no-cache-dir poetry==2.5.1 && \
    poetry config virtualenvs.create false

# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./app/pyproject.toml ./app/poetry.lock* /app/

# Allow installing dev dependencies to run tests
ARG INSTALL_DEV=false
RUN bash -c "if [ $INSTALL_DEV == 'true' ] ; then poetry install --no-root ; else poetry install --no-root --only main ; fi"

# /start.sh (production) and /start-reload.sh (development) both run
# /app/prestart.sh first, then serve the API on port 80
COPY ./start.sh ./start-reload.sh /
RUN chmod +x /start.sh /start-reload.sh

COPY ./app /app
ENV PYTHONPATH=/app

EXPOSE 80

CMD ["/start.sh"]
