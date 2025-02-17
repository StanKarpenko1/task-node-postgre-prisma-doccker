# Use an official node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and the package-lock.json to the ontainer
COPY package*.json ./

# Install the dependencies
RUN npm install

#copy the rest of the application code
COPY . .

#Expose the port the app runs on
EXPOSE 5003

#Define the command to run the app
CMD ["node", "./src/server.js"]