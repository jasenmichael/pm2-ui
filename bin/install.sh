#!/bin/bash

INSTALL_DIR=pm2-ui
STARTING_DIR=$PWD

# check if dir already exist, go in
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
# todo: check and or install pm2
echo "RUNNING: npm install"
npm install >/dev/null 2>&1
echo "RUNNING: npm run build"
npm run build >/dev/null 2>&1
sleep 2
echo "RUNNING: PORT=8085 HOST=0.0.0.0 pm2 start -n pm2-ui npm -- start"
pm2 delete pm2-ui >/dev/null 2>&1
PORT=8085 HOST=0.0.0.0 pm2 start -n pm2-ui npm -- start >/dev/null 2>&1
pm2 save >/dev/null 2>&1
todo: pm2 startup
reinstal and update pm2-ui

cd $STARTING_DIR
echo "Installation complete"
if ! [ -x "$(command -v python)" ]; then
    # echo 'Error: git is not installed.' >&2
    # exit 1
    echo "PM2-UI Avaialble at http://localhost:8085"
else
    echo "Opening PM2-UI at http://localhost:8085"
    python -mwebbrowser http://localhost:8085
fi
