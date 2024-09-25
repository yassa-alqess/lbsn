# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.17.1

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app
################################################################################
# Create a stage for installing prod dependencies.
FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
################################################################################
# Create a stage for building the application.
FROM deps as build

# Download additional dev dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build
################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use prod node environment by default.
ENV NODE_ENV prod

# Create a new user with UID and GID
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /usr/app
RUN chown -R appuser:appgroup /usr/app 

# Switch to the new user
USER appuser

# Create necessary directories and set ownership to appuser
RUN mkdir -p /usr/app/upload \
    && mkdir -p /usr/app/.logs \
    && mkdir -p /usr/app/.keys \
    && mkdir -p /usr/app/certs 


# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the prod dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Run the application.
CMD ["npm", "run", "start"]
################################################################################
FROM base as dev

ENV NODE_ENV dev

# Create a new user with UID and GID
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /usr/app
RUN chown -R appuser:appgroup /usr/app 

RUN npm install -g ts-node
COPY package*.json ./
RUN npm install

# Switch to the new user
USER appuser

# Create necessary dirs and set ownership to appuser
RUN mkdir -p /usr/app/upload \
    && mkdir -p /usr/app/.logs \
    && mkdir -p /usr/app/.keys


COPY . .

CMD [ "npm", "run", "dev" ]