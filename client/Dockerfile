FROM node:20.2-alpine3.18

RUN mkdir -p /srv/app/admin-client

WORKDIR /srv/app/admin-client

COPY package*.json ./

RUN npm install && \
	npm install -y socket.io-client && \
	npm install -y react-toastify && \
	npm install @types/express && \
	npm install @types/socket.io-client && \
	npm install class-validator class-transformer && \
	npm install zustand
COPY . .

RUN npm run build

# CMD ["npm", "start"] production context
CMD ["npm", "run", "dev"]