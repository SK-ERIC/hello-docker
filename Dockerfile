# 使用 Node.js 基础镜像
FROM node:18-alpine AS builder 

# 设置工作目录
WORKDIR /app

# 复制包管理文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --production

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]

# 生产阶段
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80