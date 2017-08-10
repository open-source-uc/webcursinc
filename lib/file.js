const fs = require('fs')
const request = require('./request')
const format = require('./format')

class File {
  constructor(fileData, parent) {
    const {name, url} = fileData
    if (name.split('.').length > 1) {
      this.name = name
    } else {
      this.name = name + '.' + url.split('.').slice(-1)[0]
    }
    this.name = this.name.replace(/\+/g, ' ')
    this.url = url
    this.parent = parent
    this.id = this.path('')
  }

  path(path) {
    return this.parent.path(path) + '/' + format.nameCleaned(this.name)
  }

  shouldDownload(path) {
    if (fs.existsSync(path + '/' + this.path())) {
      return false
    }
    return true
  }

  download(path) {
    return new Promise((res, rej) => {
      request(this.url).on('response', response => {
        console.log(`${this.parentAcronym()} Downloaded file`)
        console.log(this.parent.name.trim() + '/' + this.name)
        response.pipe(fs.createWriteStream(this.path(path)))
        res()
      })
    })
  }

  parentAcronym() {
    if (!this.parent.acronym) {
      return this.parent.parentAcronym()
    }
    return this.parent.acronym
  }
}

module.exports = File
