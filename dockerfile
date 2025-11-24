FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install express body-parser mongoose multer cors jsonwebtoken bcrypt dotenv mongodb
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
