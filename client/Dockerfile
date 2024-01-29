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
	npm install zustand && \
	npm install sudo && \
	npm install dotenv

COPY . .

RUN npm run build

# ENTRYPOINT ["./script.sh"]

# CMD ["npm", "start"]
CMD [ "npm", "run" ,"start" ]
# CMD ["npm", "run", "dev"]