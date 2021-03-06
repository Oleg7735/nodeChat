FROM node:8
ENV NODE_ENV production
RUN mkdir /chat
ADD . /chat
WORKDIR /chat
RUN npm i
EXPOSE 3000
CMD ["npm", "start"]