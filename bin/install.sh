#!/bin/bash

INSTALL_DIR=pm2-ui
STARTING_DIR=$PWD

if [ -d "pm2-ui" ]; then
    echo "exist..."
    cd pm2-ui
fi

if [ -d "server" ] && [ -d ".nuxt" ]; then
    git fetch --all >/dev/null 2>&1
else
    git clone git@github.com:jasenmichael/pm2-ui.git pm2-ui
    cd $INSTALL_DIR
fi

pm2 delete pm2-ui >/dev/null 2>&1
sleep 2

echo "RUNNING: npm install"
npm install >/dev/null 2>&1
sleep 2

echo "RUNNING: PORT=8085 HOST=0.0.0.0 npm run build"
PORT=8085 HOST=0.0.0.0 npm run build >/dev/null 2>&1
sleep 2

echo "RUNNING: PORT=8085 HOST=0.0.0.0 pm2 start -n pm2-ui npm -- start"
PORT=8085 HOST=0.0.0.0 pm2 start -n pm2-ui npm -- start >/dev/null 2>&1
pm2 save >/dev/null 2>&1

cd $STARTING_DIR
echo "Installation complete"
echo "Starting PM2-UI"
sleep 4
if ! [ -x "$(command -v python)" ]; then
    
    echo "PM2-UI Avaialble at http://localhost:8085"
else
    echo "Opening PM2-UI at http://localhost:8085"
    python -mwebbrowser http://localhost:8085
fi
