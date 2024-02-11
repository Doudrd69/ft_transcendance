FROM node:latest

RUN mkdir -p /srv/app/admin-client

WORKDIR /srv/app/admin-client

COPY package*.json ./

ARG API_URL
ARG AUTH_API_URL
ENV NEXT_PUBLIC_API_URL=$API_URL
ENV NEXT_PUBLIC_AUTH_API_URL=$AUTH_API_URL

RUN npm install && \
	npm install -y socket.io-client && \
	npm install -y react-toastify && \
	npm install @types/express && \
	npm install @types/socket.io-client && \
	npm install class-validator class-transformer && \
	npm install sudo && \
	npm install dotenv && \
	npm install image-js  && \
	npm install promise-file-reader


COPY . .

RUN npm run build

CMD [ "npm", "run" ,"dev" ]
# CMD [ "npm", "run" ,"start"]
