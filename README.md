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
