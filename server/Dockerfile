FROM node:20.2-alpine3.18

RUN mkdir -p /srv/app/admin-server

WORKDIR /srv/app/admin-server

COPY package*.json ./

COPY script.sh ./


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

# RUN chmod 777 ./script.sh

COPY . .

RUN [ "npm", "run", "build" ]

# RUN mkdir -pv dist/users/avatars

COPY ./avatar.png ./dist/users/avatars/avatar.png

# ENTRYPOINT [ "./script.sh" ]

CMD ["npm", "run", "start:dev"]