FROM node:alpine

WORKDIR /home/app

COPY ./package.json ./
RUN npm install
RUN apk add --update bash
COPY ./ ./

CMD ["npm", "start"]