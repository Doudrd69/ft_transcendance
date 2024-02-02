FROM node:20.3.1

RUN mkdir -p /srv/app/admin-client

WORKDIR /srv/app/admin-client

COPY package*.json ./

ARG API_URL
ENV NEXT_PUBLIC_API_URL=$API_URL

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

CMD [ "npm", "run" ,"start" ]