FROM node:20.3.1

RUN mkdir -p /srv/app/admin-server

WORKDIR /srv/app/admin-server

COPY package*.json ./

RUN npm install	&& \
	npm install @nestjs/jwt \
	@types/node \
	@nestjs/typeorm \
	@nestjs/serve-static \
	pg	\
	bcrypt \
	@types/bcrypt \
	speakeasy qrcode \
	dotenv \
	socket.io \
	@nestjs/websockets \
	@nestjs/platform-socket.io \
	@types/express \
	@nestjs/common	\
	@types/multer	\
	@types/image-type \
	jimp@latest	\
	@nestjs/platform-express \
	class-validator class-transformer \
	sudo

COPY . .

RUN [ "npm", "run", "build" ]

COPY ./avatar.png ./dist/users/avatars/avatar.png

CMD ["npm", "run", "start:dev"]