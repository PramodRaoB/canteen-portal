FROM node:16

# create /backend and set as workdir
WORKDIR /backend

# Copy contents of current folder into /backend in container
COPY . .

RUN npm install
CMD npm start
