# 多阶段构建：同时包含 Node 运行时和 Nginx
FROM node:18-alpine AS builder

# 安装 pnpm 并构建应用
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 生产阶段：同时包含 Node 运行时和 Nginx
FROM node:18-alpine AS production

# 安装运行时依赖
RUN npm install -g pnpm pm2
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 安装并配置 Nginx
RUN apk add --no-cache nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# 配置启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000 80
CMD ["/start.sh"]
