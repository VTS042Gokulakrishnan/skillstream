# Base Node image
FROM node:18

# Install all compilers/interpreters
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    g++ \
    gcc \
    php \
    ruby-full \
    golang-go \
    mono-mcs \
    swift \
    r-base \
    curl \
    && apt-get clean

# Install additional tools via npm for TypeScript, Kotlin, and Rust
RUN npm install -g ts-node typescript \
    && curl https://sh.rustup.rs -sSf | bash -s -- -y \
    && curl -s https://get.sdkman.io | bash \
    && bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

# Add Rust binaries to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Set working directory
WORKDIR /usr/src/app

# Copy package.json
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose backend port
EXPOSE 8080

# Run backend
CMD ["npm", "run", "dev"]


# # Use Node.js base image
# FROM node:18

# # Install Java (needed for compiling/running Java code)
# RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get clean

# # Set working directory
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install --production

# # Copy the rest of the app
# COPY . .

# # Expose the port your app runs on
# EXPOSE 8080

# # Start the app
# CMD ["npm", "run", "dev"]
