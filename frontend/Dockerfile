FROM node:17 

# create /frontend and set as workdir
WORKDIR /frontend

# Copy contents of current folder into /frontend in container
COPY . .

RUN npm install
CMD npm start
