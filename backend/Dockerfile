FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
COPY tests ./tests
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
