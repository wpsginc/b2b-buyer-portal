#!/bin/bash

# Exit immediately if any command fails
set -e

# Get the version from root package.json and replace dots with dashes
VERSION=$(cat package.json | grep version | head -1 | awk -F': ' '{ print $2 }' | sed 's/[",]//g' | sed 's/[,.]/-/g')

# Define all environment variables
B2B_URL="https://api-b2b.bigcommerce.com"
B2B_SOCKET_URL="https://api-b2b.bigcommerce.com"
TRANSLATION_SERVICE_URL="https://api-b2b.bigcommerce.com"
CAPTCHA_SETKEY="captcha_setkey"
B2B_CLIENT_ID="dl7c39mdpul6hyc489yk0vzxl6jesyx"
LOCAL_DEBUG="FALSE"
LOCAL_GRAPHQL_ORIGIN="https://api-b2b.bigcommerce.com"
NETSUITE_BACKEND="https://wpsgincbackend.ashyground-8782191a.eastus.azurecontainerapps.io/api/v1/ns-routes/production"
NETSUITE_TOKEN="CYeGLOgpAP8fwBUwKV57ukB9"
ENCRYPTION_SECRET="7xIhEmrpEDIdRcumPQi6xwN5"
B2B_TFS_LOGO="https://store-lnvrhcdjaz.mybigcommerce.com/content/TFS-logo.png"
B2B_OS_LOGO="https://store-lnvrhcdjaz.mybigcommerce.com/content/officerstore.png"
B2B_EMS_LOGO="https://store-lnvrhcdjaz.mybigcommerce.com/content/emsstore.png"
B2B_GD_LOGO="https://store-lnvrhcdjaz.mybigcommerce.com/content/gideontactical.png"

# Define the base URL for assets
ASSETS_BASE_URL="https://buyersportal.z13.web.core.windows.net/BPE"
ASSETS_ABSOLUTE_PATH="'${ASSETS_BASE_URL}/${VERSION}/assets/'"
echo $ASSETS_BASE_URL

# Create a temporary file
TEMP_FILE=$(mktemp)

# Write the .env file with all variables and comments
cat > "$TEMP_FILE" << EOL
# URL of the B2B API, if doing local development, this should be the URL of the local B2B API with its own port
VITE_B2B_URL=${B2B_URL}

# URL of the B2B Socket - this should be the same as the B2B API URL
VITE_B2B_SOCKET_URL=${B2B_SOCKET_URL}

# URL of the B2B Translation Service - if doing local development, try with localhost:5000 or check the service URL
VITE_TRANSLATION_SERVICE_URL=${TRANSLATION_SERVICE_URL}

# Captcha Site Key for the storefront
VITE_CATPCHA_SETKEY=${CAPTCHA_SETKEY}

# Client ID issued by B2B Edition for the storefront
VITE_B2B_CLIENT_ID=${B2B_CLIENT_ID}

# Set this to TRUE to debug in your default storefront
VITE_LOCAL_DEBUG=${LOCAL_DEBUG}

# URL where the GraphQL is hosted, usually the same one as B2B_URL_API. If the GraphQL API is hosted locally, set this to the local URL
VITE_LOCAL_GRAPHQL_ORIGIN=${LOCAL_GRAPHQL_ORIGIN}

# For custom host, set this to the absolute path where will be hosted the generated assets after your run \`yarn build\`
VITE_ASSETS_ABSOLUTE_PATH=${ASSETS_ABSOLUTE_PATH}

VITE_NETSUITE_BACKEND=${NETSUITE_BACKEND}

VITE_NETSUITE_TOKEN=${NETSUITE_TOKEN}

VITE_ENCRYPTION_SECRET=${ENCRYPTION_SECRET}

VITE_B2B_TFS_LOGO=${B2B_TFS_LOGO}

VITE_B2B_OS_LOGO=${B2B_OS_LOGO}

VITE_B2B_EMS_LOGO=${B2B_EMS_LOGO}

VITE_B2B_GD_LOGO=${B2B_GD_LOGO}
EOL

# Ensure the directory exists
mkdir -p apps/storefront

# Move the temporary file to replace the original .env
mv "$TEMP_FILE" apps/storefront/.env

echo "Created new .env file with version ${VERSION}"

# Run yarn commands - script will stop if any command fails due to set -e
echo "Running yarn lint..."
#yarn lint

echo "Running yarn format..."
#yarn format

echo "Running yarn build..."
#yarn build