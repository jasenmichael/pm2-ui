/* eslint-disable no-unused-vars */

const express = require( 'express' )
const api = express.Router()
const ip = require( 'ip' )
const detect = require( 'detect-port' )
const shell = require( '../../plugins/exec' )

const homePageRoutes = [
  '/api/list',
  '/api/list/:id|name',
  '/api/add/ {name, port}',
  '/api/start/:id|name',
  '/api/stop/:id|name',
  '/api/restart/:id|name',
  '/api/delete/:id|name'
]

const commands = {
  list: 'pm2 jlist',
  start: 'pm2 start', // needs id|name|all
  stop: 'pm2 stop', // needs id|name|all
  restart: 'pm2 restart', // needs id|name|all
  save: 'pm2 save -u $USER',
  delete: 'pm2 delete' // needs id|name|all
}

// home - shows api routes
api.get( '/', ( req, res ) => {
  res.json( homePageRoutes )
} )

api.get( '/list', async ( req, res ) => {
  const list = await getList()
  res.json( list )
  //   console.log(data) // eslint-disable-line
} )

api.get( '/list/:id', async ( req, res ) => {
  const id = req.params.id
  const data = await listItemById( id )
  data.error ? res.status( 404 ) : res.status( 200 )
  res.json( data )
} )

api.get( '/start/:name', async ( req, res ) => {
  const name = req.params.name
  const command = `${commands.start} ${name}`
  const data = await shell( command )
  if ( data.error ) {
    res.status( 404 )
    res.json( {
      error: data.output
    } )
  }
  //   console.log(data) // eslint-disable-line
  res.redirect( `/api/list/${name}` )
  //   res.json(data)
} )

api.get( '/stop/:name', async ( req, res ) => {
  const name = req.params.name
  const command = `${commands.stop} ${name}`
  const data = await shell( command )
  if ( data.error ) {
    res.status( 404 )
    res.json( {
      error: data.output
    } )
  }
  //   console.log(data) // eslint-disable-line
  res.redirect( `/api/list/${name}` )
} )

api.get( '/restart/:name', async ( req, res ) => {
  const name = req.params.name
  const command = `${commands.restart} ${name}`
  const data = await shell( command )
  if ( data.error ) {
    res.status( 404 )
    res.json( {
      error: data.output
    } )
  }
  //   console.log(data) // eslint-disable-line
  res.redirect( `/api/list/${name}` )
} )

api.get( '/delete/:name', async ( req, res ) => {
  const name = req.params.name
  const command = `${commands.delete} ${name}`
  //   console.log(command) // eslint-disable-line
  const data = await shell( command )
  // console.log(data) // eslint-disable-line
  if ( data.error ) {
    res.status( 404 )
    res.json( {
      error: `Process ${name} not found`
    } )
  } else {
    res.json( {
      deleted: `Process ${name} deleted`
    } )
  }
} )

api.post( '/add', async ( req, res ) => {
  const data = await add( req.body )
  if ( data === req.body.name + ' exists' ) {
    res.status( '404' )
    res.json( {
      error: data
    } )
  } else {
    res.json( data )
  }
} )

api.get( '/save', async ( req, res ) => {
  const data = await save()
  res.json( data )
} )
api.get( '/status/:id', async ( req, res ) => {
  const id = req.params.id
  const data = await getStatus( id )
  const result = ( data === `${id} doesn't exist` ) ? {
    error: data
  } : {
    status: data
  }
  result.error ? res.status( 404 ) : res.status( 200 )
  res.json( result )
} )

api.get( '/info', async ( req, res ) => {
  const info = await getInfo()
  res.json( info )
} )

// functions
async function formatItem( item ) {
  const lanHost = ( item.pm2_env.env.HOST === '0.0.0.0' ) ? ip.address() : undefined
  let lanUrl
  let url
  if ( lanHost && item.pm2_env.env.PORT && ( item.pm2_env.env.HOST === 'localhost' ) ) {
    url = `http://localhost:${item.pm2_env.env.PORT}`
    lanUrl = `http://${lanHost}:${item.pm2_env.env.PORT}`
  }
  if ( item.pm2_env.env.PORT ) {
    url = `http://localhost:${item.pm2_env.env.PORT}`
  } else {
    url = undefined
  }

  const data = await {
    id: item.pm_id,
    name: item.name,
    pid: item.pid,
    // running: (item.pid > 0 && item.monit.memory > 0),
    status: await getStatus( item.pm_id ),
    details: await getItemDetailedInfo( item.pm_id ),
    exec_interpreter: item.pm2_env.exec_interpreter || '?',
    port: item.pm2_env.env.PORT,
    host: item.pm2_env.env.HOST,
    url,
    lan_url: ( item.pm2_env.env.HOST === '0.0.0.0' ) ? url.replace( 'localhost', ip.address() ) : undefined,
    pwd: item.pm2_env.env.PWD,
    args: item.pm2_env.args,
    user: item.pm2_env.env.USERNAME,
    env: item.pm2_env.env
  }
  return data
}

async function save() {
  const data = await shell( commands.save )
  console.log( data ) // eslint-disable-line
  if ( data.exitcode === 0 ) {
    data.saved = true
    return data
  } else {
    return {
      error: data.output
    }
  }
}

async function getStatus( id ) {
  const data = await shell( `pm2 describe ${id} | sed -n 3p` )
  //   console.log(data) // eslint-disable-line
  if ( data.exitcode === 0 ) {
    if ( data.output !== `[PM2][WARN] ${id} doesn't exist` ) {
      return data.output
        .replace( 'status', '' )
        .replace( /│/g, '' )
        .trim()
    } else {
      return `${id} doesn't exist`
    }
  }
}
async function getItemDetailedInfo( id ) {
  const data = await shell( `pm2 describe ${id}` )
  const delimiter = '\n'

  if ( data.exitcode === 0 ) {
    if ( data.output !== `[PM2][WARN] ${id} doesn't exist` ) {
      const commandOutput = data.output
        .split( " Actions available " )[ 0 ]
        .split( '\n' )
        .slice( 2, -2 )
        .map( item => {
          const newItem =
            item
            .slice( 1, -1 )
            .trim()
            .split( "│" )
          const result = {
            [ newItem[ 0 ].trim() ]: newItem[ 1 ].trim()
          }
          console.log( result )
          return result
        } )
      const info = Object.assign( {}, ...commandOutput )
      console.log( 'info----', info )
      return info

    } else {
      return `${id} doesn't exist`
    }
  }
}
const getList = async function () {
  const data = await shell( commands.list )
  const list = JSON.parse( data.output )
  if ( !list.length ) {
    return []
  }
  if ( data.exitcode === 0 ) {
    const newList = []
    for ( let i = 0; i < list.length; i++ ) {
      const item = list[ i ]
      const formattedItem = await formatItem( item )
      newList.push( formattedItem )
      if ( i === list.length - 1 ) {
        // remove 
        return newList.filter( function ( item ) {
          // console.log(newList)
          return item.name !== 'pm2-ui'
        } )
      }
    }
  } else {
    return {
      error: 'error'
    }
  }
}

async function listItemById( id ) {
  const data = await shell( commands.list )
  const result = JSON.parse( data.output ).find( item => ( item.name === id | item.pm_id == id ) )
  //   console.log(result) // eslint-disable-line
  if ( !result ) {
    return {
      error: `${id} not found`
    }
  } else {
    return formatItem( result )
  }
}

async function add( body ) {
  const exist = await getStatus( body.name )
  const error = []
  let canStart = body.start

  // check vaid port
  const portOpen = await checkPortOpen( body.port )
  const portConfigured = await checkPortConfigured( body.port )
  // check port configured, if all ready running on that port- do not start
  if ( !portConfigured && !portOpen ) {
    error.push( `${body.port} port in use by another service` )
  }

  const validPort = await checkValidPort( body.port )
  if ( !validPort ) {
    error.push( `${body.port} invalid port` )
  }

  // check name exist
  if ( exist !== `${body.name} doesn't exist` ) {
    error.push( `name ${body.name} exists` )
  }

  if ( portConfigured === true ) {
    canStart = false
  }
  //   console.log(error)
  if ( error.length ) {
    return {
      error: error.length === 1 ? error[ 0 ] : error
      // error
    }
  }
  const name = body.name
  const port = body.port
  const path = body.path
  const startCommand = body.startCommand
    .replace( 'npm run start', 'npm -- start' )
    .replace( 'npm', 'npm --' )
  const lan = body.lan
  const start = !canStart ? ` && ${commands.stop} ${name}` : ''
  const build = ( startCommand !== 'npm -- run dev' ) ? ` PORT=${port} HOST=${lan ? '0.0.0.0' : 'localhost'} ${body.buildCommand} &&` : ''

  const command = `cd ${path} &&${build} PORT=${port} HOST=${lan ? '0.0.0.0' : 'localhost'} pm2 start -n ${name} ${startCommand} ${start}`.trim()
  const data = await shell( command )
  console.log( command ) // eslint-disable-line
  const result = await listItemById( name )
  if ( data.exitcode === 0 ) {
    return result
  }
}

async function checkPortConfigured( port ) {
  const list = await getList()
  if ( list !== undefined ) {
    return list.some( function ( item ) {
      return item.port == port && item.status === 'online'
    } )
  } else {
    return false
  }
}

function checkPortOpen( port ) {
  return detect( port )
    .then( ( _port ) => {
      if ( Number( port ) === Number( _port ) ) {
        // console.log(`port: ${port} was not occupied`)
        return true
      } else {
        // console.log(`port: ${port} was occupied, try port: ${_port}`)
        return false
      }
    } )
    .catch( () => {} )
}

async function checkValidPort( port ) {
  const isValid = port >= 0 && port < 65536
  // port 80 is not valid
  if ( port == 80 ) {
    // console.log(`${port} is inValid ${isValid}`)
    return false
  }
  // if not port 80 or a configured port, check for valid port range
  return isValid
}

function getInfo() {
  console.log( `
  PORT: ${process.env.PORT}
  HOST: ${process.env.HOST}
  NODE_ENV: ${process.env.NODE_ENV}
  URL: http://${process.env.HOST === 'localhost' ? 'localhost' : ip.address()}:${process.env.PORT}
  PATH: ${__dirname.replace('/server/routes', '')}
  ` )
  return {
    host: process.env.HOST,
    port: process.env.PORT,
    path: `${__dirname.replace('/server/routes', '')}`,
    url: `http://localhost:${process.env.PORT}`,
    lanUrl: `http://${ip.address()}:${process.env.PORT}`,
    env: process.env
  }
}

module.exports = {
  api,
  getList
}
// todo
// start(name)
// npmInstall(path)
// build(path)
