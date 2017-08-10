const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const fs = require('fs')
const request = require('./request')
const urls = require('./urls')
const folder = require('./folder')
const file = require('./file')
const format = require('./format')
const error = require('./error')

class Course {
  constructor(courseData) {
    const {year, semester, acronym, section, name} = courseData
    this.year = year
    this.semester = semester
    this.acronym = acronym
    this.section = section
    this.name = name

    this.folders = {}
    this.files = {}
  }

  folderGroup() {
    return `${this.acronym.toLowerCase()}-${this.section}-${this.semester}-${this.year}`
  }

  scrap() {
    this.folders = {}
    this.files = {}
    return new Promise((res, rej) => {
      request({url: urls.course(this), encoding: null}, (err, http, body) => {
        const $ = cheerio.load(iconv.decode(body, 'utf-8'))
        const resourcesUrl = $('a.icon-sakai-resources').attr('href')
        request({url: resourcesUrl, encoding: null}, (err, http, body) => {
          const $ = cheerio.load(iconv.decode(body, 'utf-8'))
          const resourcesUrl = $('div.title')
            .find('a')
            .attr('href')
            .replace(/-reset/g, '')
          return this.scrapResources(resourcesUrl).then(() => res(this))
        })
      })
    })
  }

  scrapResources(url) {
    return new Promise((res, rej) => {
      console.log(`Parsing ${this.path()}`)
      request({url: url, encoding: null}, (err, http, body) => {
        const folders = this.scrapBody(body, this)
        return folders
          .reduce(
            (p, f) => p.then(() => this.scrapFolder(url, f)),
            Promise.resolve()
          )
          .then(res)
      })
    })
  }

  scrapBody(body, parent) {
    const $ = cheerio.load(iconv.decode(body, 'utf-8'))
    let newFolders = []
    const folders = $('table.centerLines')
      .find('h4')
      .find('a')
      .toArray()
      .map(data => {
        const name = $(data).text().replace(/[\t\r\n]+/g, '').trim()
        if (!name) {
          return {}
        }
        const regex = /value='\/group\/([a-zA-Zá-úÁ-Ú\d-_.\/ ]+)'/g
        const onclick = $(data).attr('onclick')
        const href = $(data).attr('href')

        if (onclick) {
          // It's a folder
          const match = onclick.match(regex)
          if (!match) {
            error(
              `Couldn't parse a folder url\n${onclick}`,
              'Parsing folder url'
            )
            return {}
          }
          const exec = regex.exec(match[0])
          const id = exec[1]
          return {name, id, folder: true}
        }

        if (href) {
          // It's a file
          return {name, url: href, file: true}
        }
      })
      .filter(d => d.name)
      .forEach(d => {
        if (d.folder) {
          const f = new folder(d, parent)
          if (!this.folders[f.id]) {
            this.folders[f.id] = f
            newFolders.push(f)
          }
        }
        if (d.file) {
          const f = new file(d, parent)
          this.files[f.id] = f
        }
      })
    return newFolders
  }

  scrapFolder(url, folder) {
    return new Promise((res, rej) => {
      console.log(`Parsing ${folder.name}`)
      const body = {
        source: 0,
        collectionId: `/group/${this.folderGroup()}/${folder.name}/`,
        navRoot: '',
        criteria: 'title',
        sakai_action: 'doNavigate',
        rt_action: '',
        selectedItemId: ''
      }
      request.post({url: url, encoding: null, form: body}, () => {
        return this.scrapFolderBody(url, folder).then(res)
      })
    })
  }

  scrapFolderBody(url, folder) {
    return new Promise((res, rej) => {
      request({url: url, encoding: null}, (err, http, body) => {
        const folders = this.scrapBody(body, folder)
        return folders
          .reduce(
            (p, f) =>
              p.then(() => this.scrapFolder(url.replace(/-reset/g, ''), f)),
            Promise.resolve()
          )
          .then(res)
      })
    })
  }

  path(path = '') {
    const parentPath = (path !== '' && path + '/') || ''
    return parentPath + this.acronym + ' ' + format.nameCleaned(this.name)
  }

  createFolder(path) {
    try {
      fs.mkdirSync(this.path(path))
    } catch (err) {}
  }
}

module.exports = Course
