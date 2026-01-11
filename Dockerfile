FROM node:20

WORKDIR /

COPY app/ .

# 依存関係のインストール
RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]
