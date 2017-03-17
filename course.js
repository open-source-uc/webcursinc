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
      console.log(link)
      console.log(body)
      request.post({url: link, encoding: null, form: body}, () => {
        return this.scrapFolderBody(link, folder).then(res)
      })
    })
  }

  scrapFolderBody(link, folder) {
    return new Promise((res, rej) => {
      request({url: link, encoding: null}, (err, http, body) => {
        const $ = cheerio.load(iconv.decode(body, 'utf-8'))
        console.log($.html())
        res()
      })
    })
  }
  // return new Promise((res, rej) => {
  //   request({url: this.url, encoding: null}, (err, http, body) => {
  //     if (err) {
  //       rej(err);
  //     }
  //     console.log(`Parsing ${this.path()}`);
  //     const newFolders = this.searchFoldersAndFiles(body, this);
  //     if (newFolders.length === 0) {
  //       return res(this);
  //     }
  //     Promise.all(
  //       newFolders.map(folder => this.scrapFolder(folder)),
  //     ).then(() => {
  //       res(this);
  //     });
  //   });
  // });

  // scrapFolder(folder) {
  // return new Promise((res, rej) => {
  //   request({url: folder.url, encoding: null}, (err, http, body) => {
  //     if (err) {
  //       rej(err);
  //     }
  //     console.log(`Parsing ${folder.name}`);
  //     const newFolders = this.searchFoldersAndFiles(body, folder);
  //     if (newFolders.length === 0) {
  //       return res();
  //     }
  //     Promise.all(
  //       newFolders.map(folder => this.scrapFolder(folder)),
  //     ).then(() => {
  //       res();
  //     });
  //   });
  // });
  // }

  searchFoldersAndFiles(body, parent) {
    // const $ = cheerio.load(iconv.decode(body, 'utf-8'));
    // const newFolders = [];
    // $('a').each((i, l) => {
    //   const link = $(l).attr('href');
    //   const name = $(l).text();
    //   if (link.indexOf('acc_carp') !== -1) {
    //     const linkId = link.match(/id_carpeta=\d+/g)[0].split('=')[1];
    //     if (this.folders[linkId]) {
    //       return;
    //     }
    //     const newFolder = new folder(
    //       linkId,
    //       name,
    //       urls.courseFolderURL(link),
    //       parent,
    //     );
    //     newFolders.push(newFolder);
    //     this.folders[linkId] = newFolder;
    //   } else if (link.indexOf('id_archivo') !== -1) {
    //     const linkId = link.match(/id_archivo=\d+/g)[0].split('=')[1];
    //     if (this.files[linkId]) {
    //       return;
    //     }
    //     const newFile = new file(
    //       linkId,
    //       name,
    //       urls.courseFileURL(link),
    //       parent,
    //     );
    //     this.files[linkId] = newFile;
    //   }
    // });
    // return newFolders;
  }

  path(path = '') {
    const parentPath = (path !== '' && path + '/') || ''
    return parentPath + this.acronym + ' ' + format.nameCleaned(this.name)
  }

  createFolder(path) {
    // try {
    //   fs.mkdirSync(this.path(path));
    // } catch (err) {}
  }
}

module.exports = Course
