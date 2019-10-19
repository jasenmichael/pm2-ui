# pm2-ui

> pm2 ui and api - built with nuxt

## Install Setup

``` bash
wget -Oq - https://raw.githubusercontent.com/jasenmichael/pm2-ui/master/bin/install.sh | bash
# or
curl -s https://raw.githubusercontent.com/jasenmichael/pm2-ui/master/bin/install.sh | bash
# or
git clone https://github.com/jasenmichael/pm2-ui.git pm2-ui
cd pm2-ui
./bin/install.sh
```

## Routes

gui interface
/

list all routes
/api


list all pm2 processes
/api/list


list one process
/api/list/:id|name

add process
/api/add/:name

delete process
/api/delete/:id|name

restart process
/api/restart

## TODO:


