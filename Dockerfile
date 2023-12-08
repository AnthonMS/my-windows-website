FROM node:latest

RUN mkdir /app
COPY package.json /app/
WORKDIR /app
COPY . ./

RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]