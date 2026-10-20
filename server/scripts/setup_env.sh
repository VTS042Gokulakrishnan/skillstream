#!/bin/bash

# Fetch environment variables from AWS Parameter Store
MONGODB_URI=$(aws ssm get-parameter --name "MONGODB_URI" --with-decryption --query "Parameter.Value" --output text)
PORT=$(aws ssm get-parameter --name "PORT" --with-decryption --query "Parameter.Value" --output text)


# Create .env file
cat <<EOF > /home/ec2-user/express-app/.env
MONGODB_URI=$MONGODB_URI
PORT=$PORT

EOF

# Ensure .env file has correct permissions
chmod 600 /home/ec2-user/express-app/.env
