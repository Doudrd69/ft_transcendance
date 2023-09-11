FROM node:latest

RUN mkdir -p /srv/app/admin-server

WORKDIR /srv/app/admin-server

COPY package*.json ./

RUN npm install	&& \
	npm install @nestjs/jwt && \
	npm install @nestjs/typeorm && \
	npm install @nestjs/serve-static && \
	npm install pg	&& \
	npm i bcrypt && \
	npm i @types/bcrypt

COPY . .

CMD ["npm", "run", "start:dev"]