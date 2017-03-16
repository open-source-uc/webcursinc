const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const request = require('./request')
const urls = require('./urls')
const course = require('./course')

class Portal {
  static coursesList(session, ignore = []) {
    return session.login().then(() => {
      console.log('Getting courses list')
      return new Promise((res, rej) => {
        request({url: urls.portal, encoding: null}, (err, http, body) => {
          if (err) {
            rej(err)
          }
          console.log('Parsing courses list')
          const regex = /(\d+)-(\d+)-([a-z]+\d+)-(\d) ([ ,a-zA-Zá-úÁ-Ú]+)/g
          const coursesData = []
          const courseData = (i, l) => {
            const name = $(l).text()
            const nameRegex = regex.exec(name)
            if (!nameRegex) {
              return
            }
            const courseData = {
              year: nameRegex[1],
              semester: nameRegex[2],
              acronym: nameRegex[3].toUpperCase(),
              section: nameRegex[4],
              name: nameRegex[5],
            }
            coursesData.push(courseData)
          }
          const dataFilter = k => Number(k) >= 0
          const ignoreFilter = c => ignore.indexOf(c.acronym) === -1
          const courseObject = d => new course(d)
          const $ = cheerio.load(iconv.decode(body, 'ISO-8859-1'))
          const coursesUpperBar = $('ul#siteLinkList')
            .find('li')
            .find('a')
            .each(courseData)
          const coursesMore = $('div#selectNav')
            .find('select')
            .find('option')
            .each(courseData)
            .filter(dataFilter)
          const courses = coursesData.filter(ignoreFilter).map(courseObject)
          res(courses)
        })
      })
    })
  }
}

module.exports = Portal
