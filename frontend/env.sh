#!/bin/bash

# Replace environment variables in JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|REACT_APP_WEBSOCKET_URL|${REACT_APP_WEBSOCKET_URL}|g" {} \;
