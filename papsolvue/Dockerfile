# build stage
FROM node:14 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# production stage
FROM nginx:1.21.3-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
