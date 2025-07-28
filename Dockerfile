# 使用官方Node.js镜像作为基础镜像
FROM node:20.19.4 as stage
# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建生产环境版本
RUN npm run build

# 使用轻量级的Nginx镜像来运行应用
FROM nginx

# 复制构建产物到Nginx默认目录
COPY --from=stage  /app/dist /usr/share/nginx/html

# 复制自定义Nginx配置（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]