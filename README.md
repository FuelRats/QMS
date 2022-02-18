# QMS
Queue Management System for IRC clients

# Post deployment procedure
* After first start, docker exec -it qms_backend_1 bash
* Run alembic revision --autogenerate -m "Deployment"
* Run sh ./prestart.sh
* Exit the docker shell
* docker exec -it qms_db_1 bash
* SU to postgres, run psql app, insert configuration options into config table
* Use the admin credentials to login with your favorite tool and get JWT tokens for Mecha and Board.

# Compose commands
**Start**

```docker-compose up -d```

**Restart**

```
# All
docker-compose restart -d

# Front-end / Backend
docker-compose restart -d frontend backend
```

**Logs**

```
# All logs
docker-compose logs -f

# Specific logs
docker-compose logs -f frontend
```

**Updating the code(ie after git pull)**
```
# Git pull must be done in top directory
cd ../ && git pull

# For frontend
cd qms && docker-compose up -d --build frontend

# For backend
cd qms && docker-compose up -d --build backend

# Both
cd qms && docker-compose up -d --build frontend backend
```