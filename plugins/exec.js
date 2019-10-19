const {
  exec
} = require('shelljs')

const shell = function (command) {
  const result = exec(command, {
    shell: '/bin/bash',
    silent: true
  })
  const response = {
    output: result.stdout.trim() || result.stderr.trim(),
    // stderr: result.stderr.trim(),
    exitcode: result.code
  }
  if (result.code !== 0) {
    response.error = true
  }
  return response
}

module.exports = shell
