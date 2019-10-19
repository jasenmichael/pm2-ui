#!/bin/bash

INSTALL_DIR=pm2-ui
STARTING_DIR=$PWD

# check if dir already exist, go in
if [ -d "pm2-ui" ]; then
    cd pm2-ui
fi

# check if in project dir
if [ -d "server" ] && [ -d ".nuxt" ]; then
    echo >/dev/null 2>&1
else
    git clone git@github.com:jasenmichael/pm2-ui.git pm2-ui
    cd $INSTALL_DIR
fi
# todo: check and or install pm2
echo "RUNNING: npm install"
npm install
echo "RUNNING: npm run build"
npm run build
sleep 2
echo "RUNNING: PORT=8085 HOST=0.0.0.0 pm2 start -n pm2-ui npm -- start"
PORT=8085 HOST=0.0.0.0 pm2 start -n pm2-ui npm -- start
# todo: pm2 startup
# todo: pm2 save
# reinstal and update pm2-ui

cd $STARTING_DIR
echo "Installation complete"
echo "Avaialble at http://localhost:8085"