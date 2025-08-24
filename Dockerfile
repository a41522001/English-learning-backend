FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

FROM node:22

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY prisma ./prisma         
RUN npx prisma generate 

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start"]