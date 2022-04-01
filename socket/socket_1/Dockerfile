FROM node:16

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./

# copy source code to /app/src folder
COPY src /app/src

# install dependencies
RUN npm install
RUN npm run build

# start server
CMD [ "node", "./dist/server.js"]