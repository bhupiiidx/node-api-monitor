FROM node:latest

LABEL maintainer="asabhi6776"

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    npm i -g serve

WORKDIR /code

COPY ./package.json /code

RUN npm i

#COPY ./.env /code

COPY ./index.js /code


