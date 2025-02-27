# 使用 Nginx 的 Alpine 版本作为基础镜像
FROM nginx:alpine

# 清理默认的 Nginx 配置文件
RUN rm -rf /usr/share/nginx/html/*

# 将本地的 HTML 文件复制到容器中的 Nginx 默认网站目录
COPY main.html /usr/share/nginx/html/index.html

# 移除不必要的文件
RUN rm -rf /var/cache/apk/* /tmp/*

# 暴露 80 端口
EXPOSE 80