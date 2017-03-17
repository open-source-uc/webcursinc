#!/usr/bin/env node

const prompt = require('prompt')
const fs = require('fs')
const os = require('os')
const updateNotifier = require('update-notifier')
const pkg = require('./package.json')
const Session = require('./session')
const portal = require('./portal')

prompt.colors = false

const userDataFolder = `${os.homedir()}/.webcursinc`

data = () => {
  console.log('Let\' update ur data')
  const schema = {
    properties: {
      username: {
        pattern: /^[a-zA-Z\d]+$/,
        message: 'Username without @uc',
        required: true
      },
      password: {
        required: true,
        hidden: true,
        replace: '*'
      },
      path: {
        required: true
      },
      ignore: {}
    }
  }
  prompt.start()
  const saveData = (err, result) => {
    const data = Object.assign({}, result, {ignore: result.ignore.split(' ')})
    if (!fs.existsSync(`${userDataFolder}`)) {
      fs.mkdirSync(`${userDataFolder}`)
    }
    const path = `${userDataFolder}/data.json`
    const dataJson = JSON.stringify(data)
    fs.writeFile(path, dataJson, 'utf8', run)
  }
  prompt.get(schema, saveData)
}

sync = data => {
  const session = new Session(data.username, data.password)
  portal.coursesList(session, data.ignore).then(courses => {
    console.log('Found courses')
    console.log(courses.map(c => c.path()))
    Promise.all(courses.map(course => course.scrap())).then(courses => {
      console.log('Found:')
      const found = courses.map(c => ({
        name: c.name,
        folders: Object.keys(c.folders).length,
        files: Object.keys(c.files).length
      }))
      console.log(found)
    })
  })
}

options = {
  data: data,
  sync: sync,
  exit: () => {}
}

optionsDescriptions = {
  data: 'Update your data',
  sync: 'Download everythang',
  exit: 'Exit'
}

run = () => {
  let userData = null
  try {
    userData = require(`${userDataFolder}/data.json`)
  } catch (err) {
    data()
    return
  }
  if (!userData) {
    data()
  }
  console.log('Ur data')
  console.log(`user: ${userData.username}`)
  console.log(`path: ${userData.path}`)
  console.log(`ignore: ${userData.ignore}`)
  console.log('Options')
  Object.keys(options).forEach(key => {
    console.log(`${key}: ${optionsDescriptions[key]}`)
  })
  const commandLine = options[process.argv[2]]
  if (commandLine) {
    process.argv[2] = ''
    return commandLine(userData)
  }
  prompt.start()
  runCommand = (err, result) => {
    const command = options[result.command]
    if (!command) {
      console.log('Not a valid command')
      return run()
    }
    options[result.command](userData)
  }
  prompt.get(['command'], runCommand)
}

updateNotifier({pkg}).notify()
console.log('Welcome to webcursinc!')
console.log(`Version ${pkg.version}`)
run()
