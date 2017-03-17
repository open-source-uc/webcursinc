const request = require('./request')
const urls = require('./urls')

class Session {
  constructor(username, password) {
    this.username = username
    this.password = password
  }

  login() {
    const body = {
      _username: this.username,
      _password: this.password
    }
    console.log('Starting login')
    return new Promise((res, rej) =>
      request.post({url: urls.login, form: body}, (err, http, body) => {
        console.log('Checking login')
        res()
      }))
  }
}

module.exports = Session
