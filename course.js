const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const fs = require('fs')
const request = require('./request')
const urls = require('./urls')
const folder = require('./folder')
const file = require('./file')
const format = require('./format')
const warning = require('./warning')

class Course {
  constructor(courseData) {
    const {
      year,
      semester,
      acronym,
      section,
      name
    } = courseData
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
        const resourcesLink = $('a.icon-sakai-resources').attr('href')
        request({url: resourcesLink, encoding: null}, (err, http, body) => {
          const $ = cheerio.load(iconv.decode(body, 'utf-8'))
          const resourcesLink = $('div.title').find('a').attr('href')
          return this.scrapResources(resourcesLink).then(() => res(this))
        })
      })
    })
  }

  scrapResources(link) {
    return new Promise((res, rej) => {
      console.log(`Parsing ${this.path()}`)
      request({url: link, encoding: null}, (err, http, body) => {
        const $ = cheerio.load(iconv.decode(body, 'utf-8'))
        const folders = $('table.centerLines')
          .find('h4')
          .find('a')
          .toArray()
          .map(data => {
            const name = $(data).text().replace(/[\t\r\n]+/g, '')
            if (!name) {
              return {}
            }
            const regex = /value='\/group\/([a-zA-Zá-úÁ-Ú\d-\/ ]+)'/g
            const onclick = $(data).attr('onclick')
            const href = $(data).attr('href')

            if (onclick) {
              // It's a folder
              const match = onclick.match(regex)
              if (!match) {
                warning(`Couldn't parse a link\n${onclick}`)
                return {}
              }
              const exec = regex.exec(match[0])
              const id = exec[1]
              return {name, id, folder: true}
            }

            if (href) {
              // It's a file
              return {name, link: href, file: true}
            }
          })
          .filter(d => d.name)
          .forEach(d => {
            if (d.folder) {
              const f = new folder(d, this)
              this.folders[f.id] = f
            }
            if (d.file) {
              const f = new file(d, this)
              this.files[f.id] = f
            }
          })
        return Object.values(this.folders)
          .reduce(
            (p, f) =>
              p.then(() => this.scrapFolder(link.replace(/-reset/g, ''), f)),
            Promise.resolve()
          )
          .then(res)
      })
    })
  }

  scrapFolder(link, folder) {
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
      request.post({url: link, encoding: null, form: body}, () => {
        return this.scrapFolderBody(link, folder).then(res)
      })
    })
  }

  scrapFolderBody(link, folder) {
    return new Promise((res, rej) => {
      request({url: link, encoding: null}, (err, http, body) => {
        const $ = cheerio.load(iconv.decode(body, 'utf-8'))
        // console.log($.html())
        res()
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
