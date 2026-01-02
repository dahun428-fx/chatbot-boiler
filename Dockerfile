# FROM node:20-alpine AS builder

# WORKDIR /app

# COPY package.json yarn.lock ./
# RUN yarn install --frozen-lockfile

# COPY . .

# # .env.production 파일이 있다면 복사하거나 ENV로 대체
# COPY .env.development .env.development
# COPY .env.production .env.production
# # RUN yarn build

# # MODE에 따라 build 스크립트 선택 (default=production)
# ARG MODE=production
# ENV NODE_ENV=$MODE
# RUN if [ "$MODE" = "development" ]; then yarn build:dev; else yarn build:prod; fi

# FROM nginx:alpine

# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY /nginx/nginx.conf /etc/nginx/nginx.conf

# EXPOSE 19999

# CMD ["nginx", "-g", "daemon off;"]

# ✅ Docker Hub 대신 AWS Public ECR 미러 사용
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# .env 파일 복사 (이미 같은 이름 → 사실상 no-op)
COPY .env.development .env.development
COPY .env.production .env.production

ARG MODE=production
ENV NODE_ENV=$MODE
RUN if [ "$MODE" = "development" ]; then yarn build:dev; else yarn build:prod; fi

FROM public.ecr.aws/nginx/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY /nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 19999
CMD ["nginx", "-g", "daemon off;"]

