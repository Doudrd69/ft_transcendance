FROM node:20.2-alpine3.18

RUN mkdir -p /srv/app/admin-server

WORKDIR /srv/app/admin-server

COPY package*.json ./

RUN npm install	&& \
	npm install @nestjs/jwt && \
	npm install @types/node && \
	npm install @nestjs/typeorm && \
	npm install @nestjs/serve-static && \
	npm install pg	&& \
	npm i bcrypt && \
	npm i @types/bcrypt && \
	npm install speakeasy qrcode && \
	npm install dotenv

COPY . .

CMD ["npm", "run", "start:dev"]