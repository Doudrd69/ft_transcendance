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
	npm install bcrypt && \
	npm install @types/bcrypt && \
	npm install speakeasy qrcode && \
	npm install dotenv && \
	npm install socket.io && \
	npm install @nestjs/websockets && \
	npm install @nestjs/platform-socket.io &&\
	npm install @types/express && \
	npm install @nestjs/common	&&\
	npm install @types/multer	&&\
	npm install @types/image-type &&\
	npm install jimp@latest	&& \
	npm install @nestjs/platform-express && \
	npm install class-validator class-transformer

COPY . .

CMD ["npm", "run", "start:dev"]