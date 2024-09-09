# Use the official Bun image as the base
FROM oven/bun:1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the application code into the container
COPY . .

# Install dependencies
RUN bun install

# Set environment variables
ENV DATABASE_URL=postgres://myuser:mypassword@db:5432/mydatabase

# Expose the app's port
EXPOSE 3000

# Start the application with Prisma migrations
CMD ["sh", "-c", "bun run prisma db push --force-reset && bun start"]