ENV NODE_ENV production
FROM node:8
RUN mkdir /chat
ADD . /chat
WORKDIR /chat
RUN npm i
EXPOSE 3000
CMD ["npm", "start"]