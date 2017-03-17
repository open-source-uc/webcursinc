const fs = require('fs')
const request = require('./request')
const format = require('./format')

class File {
  constructor(fileData, parent) {
    const {name, link} = fileData
    this.name = name
    this.link = link

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
        console.log(this.parent.name + '/' + this.name)
        response.pipe(fs.createWriteStream(this.path(path)))
        res()
      })
    })
  }

  parentAcronym() {
    return this.parent.parentAcronym()
  }
}

module.exports = File
