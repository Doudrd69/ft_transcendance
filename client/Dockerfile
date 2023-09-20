FROM node:20.2-alpine3.18


RUN mkdir -p /srv/app/admin-client

WORKDIR /srv/app/admin-client

COPY package*.json ./

RUN npm install
	# npm install react-router-dom && \
	# npm install react-bootstrap

COPY . .
RUN npm run build

# CMD ["npm", "start"] production context
CMD ["npm", "run", "dev"]