# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包含开发依赖）
RUN npm install

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 清理默认配置文件
RUN rm -f /etc/nginx/conf.d/default.conf

# 复制构建好的 Next.js 项目
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/.next/server/pages /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html

# 添加 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80