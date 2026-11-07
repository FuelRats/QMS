# Alpine security updates on top of the Flower release, which can lag the Alpine repos.
FROM mher/flower:2.2
USER root
RUN apk upgrade --no-cache
USER flower
