FROM node:22.8.0-slim

RUN apt update && \
    npm i -g pnpm

USER node

WORKDIR /home/node/app

CMD [ "tail", "-f", "/dev/null"]