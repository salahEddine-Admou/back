# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV MONGO_URI='mongodb+srv://root:root@e-learning.uhzxixs.mongodb.net/e-learning?retryWrites=true&w=majority&appName=e-learning'
ENV PORT=3000
ENV CLERK_SECRET_KEY=sk_test_u7OaH7f2vfnkratKmpwdflZJuJZyoeNjUqscEk5VAJ
ENV CLOUD_NAME=dwiwbp0yv
ENV API_KEY=842251535298153
ENV API_SECRET=J9D5HRcWnLnQOdKiDwNYxsWWQvo

# Command to run the application
CMD ["npm", "start"]
