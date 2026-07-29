FROM node:20-slim
WORKDIR /app
COPY package*.json .
RUN npm config set fetch-timeout 100000 && npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]