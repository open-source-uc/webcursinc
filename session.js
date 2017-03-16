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
      _password: this.password,
    }
    console.log('Starting login')
    return new Promise((res, rej) =>
      request.post({url: urls.login, form: body}, (err, http, body) => {
        console.log('Checking login')
        // Check login succedded
        // rej() if not
        res()
        // return request.post({url: urls.portal}, (err, http, body) => {
        //   console.log('body');
        //   console.log(body);
        //   res();
        // });
      }))
  }

  sync(path) {
    // console.log('sync');
    // console.log(path);
  }
}

module.exports = Session
