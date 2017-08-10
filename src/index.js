#!/usr/bin/env node

const prompt = require('prompt')
const fs = require('fs')
const os = require('os')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const Session = require('../lib/session')
const portal = require('../lib/portal')
const error = require('../lib/error')

prompt.colors = false

const userDataFolder = `${os.homedir()}/.webcursinc`

data = (data = {}) => {
  console.log('Let\'s update your user data')
  if (data.username) {
    console.log(
      ' For each prompt the value in () is the current one\n Press enter if you don\'t want to change it'
    )
  }
  const schema = {
    properties: {
      username: {
        pattern: /^[a-zA-Z\d]+$/,
        message: 'Username without @uc',
        required: true,
        default: data.username || ''
      },
      password: {
        required: true,
        hidden: true,
        replace: '*'
      },
      path: {
        required: true,
        default: data.path || '',
        conform: path => {
          if (!fs.existsSync(path)) {
            console.log('The provided path doesn\'t exist')
            return false
          }
          return true
        }
      },
      ignore: {
        pattern: /^[a-zA-Z\d ]+$/,
        message: 'Course acronyms separated by a space',
        default: (data.ignore || []).join(' ')
      }
    }
  }
  prompt.start()
  const saveData = (err, result) => {
    if (!result) {
      return exit()
    }
    const data = Object.assign({}, result, {
      ignore: result.ignore.split(' ').map(a => a.toUpperCase())
    })
    if (!fs.existsSync(`${userDataFolder}`)) {
      fs.mkdirSync(`${userDataFolder}`)
    }
    const path = `${userDataFolder}/data.json`
    const dataJson = JSON.stringify(data)
    fs.writeFile(path, dataJson, 'utf8', run)
    console.log('Updated user data')
  }
  prompt.get(schema, saveData)
}

sync = data => {
  const session = new Session(data.username, data.password)
  portal.coursesList(session, data.ignore).then(courses => {
    console.log('\nFound courses')
    courses.forEach(c => console.log(` - ${c.path()}`))
    console.log('')
    Promise.all(courses.map(course => course.scrap()))
      .then(courses => {
        console.log('\nFound:')
        const found = courses.map(c => ({
          name: c.name,
          folders: Object.keys(c.folders).length,
          files: Object.keys(c.files).length
        }))
        coursesSummary(found)
        console.log('\nDownload:')
        const downloads = courses.map(c => ({
          name: c.name,
          folders: Object.keys(c.folders)
            .filter(id => c.folders[id].shouldCreate(data.path))
            .map(id => c.folders[id]),
          files: Object.keys(c.files)
            .filter(id => c.files[id].shouldDownload(data.path))
            .map(id => c.files[id])
        }))
        const downloadNumbers = downloads.map(download => ({
          name: download.name,
          folders: download.folders.length,
          files: download.files.length
        }))
        coursesSummary(downloadNumbers)
        console.log('\nCreating missing folders...')
        courses.forEach(course => course.createFolder(data.path))
        downloads.forEach(d => d.folders.forEach(f => f.create(data.path)))
        console.log('\nStarting downloads, this may take a while...')
        const files = downloads
          .map(download => download.files)
          .reduce((total, arr) => total.concat(arr))
        Promise.all(files.map(file => file.download(data.path))).then(() =>
          console.log('\nFinished downloading!')
        )
      })
      .catch(err => error(err, 'Running sync'))
  })
}

coursesSummary = courses =>
  courses.forEach(c => {
    const log = `
- ${c.name}
  - folders: ${c.folders}
  - files: ${c.files}`
    console.log(log)
  })

exit = () => {
  console.log('\nTerminated sincding')
}

options = {
  data: data,
  sync: sync,
  exit: exit
}

optionsDescriptions = {
  data: 'Update your user data',
  sync: 'Download sincding files',
  exit: 'Exit sincding'
}

const loadUserData = () => {
  let userData = null
  try {
    userData = JSON.parse(
      fs.readFileSync(`${userDataFolder}/data.json`, 'utf8')
    )
  } catch (err) {
    console.error('Could\'t load user data')
  }
  return userData
}

run = () => {
  console.log('')
  // Load user data
  const userData = loadUserData()
  if (!userData) {
    return data()
  }
  // Show user data
  console.log('Current user data')
  console.log(`user: ${userData.username}`)
  console.log(`path: ${userData.path}`)
  console.log(`ignore: ${(userData.ignore || []).join(' ')}`)
  console.log('')
  // If a command was supplied in the call, execute it
  const commandLine = options[process.argv[2]]
  if (commandLine) {
    console.log(`Executing \'${process.argv[2]}\' command`)
    process.argv[2] = ''
    return commandLine(userData)
  }
  // Show available commands
  console.log('Commands:')
  Object.keys(options).forEach(key => {
    console.log(` - ${key}: ${optionsDescriptions[key]}`)
  })
  // Prompt user for command
  prompt.start()
  runCommand = (err, result) => {
    if (!result || err) {
      return exit()
    }
    const command = options[result.command]
    if (!command) {
      console.log('Not a valid command')
      return run()
    }
    // Execute selected command
    console.log(`Executing \'${result.command}\' command`)
    options[result.command](userData)
  }
  prompt.get(['command'], runCommand)
}

const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 // 1 hour
}).notify()
console.log('Welcome to webcursinc!')
console.log(`Version ${pkg.version}`)
run()
