const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const request = require('./request');
const urls = require('./urls');
const course = require('./course');

class Portal {
  static coursesList(session, ignore = []) {
    return session.login().then(() => {
      console.log('Getting courses list');
      return new Promise((res, rej) => {
        request({url: urls.portal, encoding: null}, (err, http, body) => {
          if (err) {
            rej(err);
          }
          console.log('Parsing courses list');
          const regex = /\d+-\d+-([a-z]+\d+)-\d ([ ,\ta-zA-Zá-úÁ-Ú]+)/g;
          const empty = {link: '', name: '', acronym: ''};
          const $ = cheerio.load(iconv.decode(body, 'ISO-8859-1'));
          const data1 = $('ul#siteLinkList')
            .find('li')
            .find('a')
            .map((i, l) => {
              const link = $(l).attr('href');
              const linkName = $(l).text();
              const linkNameRegex = regex.exec(linkName);
              if (!linkNameRegex) {
                return empty;
              }
              const acronym = linkNameRegex[1].toUpperCase();
              const name = linkNameRegex[2];
              return {link, name, acronym};
            });
          const array1 = Object.keys(data1)
            .filter(k => Number(k) >= 0)
            .map(k => data1[k]);
          const data2 = $('div#selectNav')
            .find('select')
            .find('option')
            .map((i, l) => {
              const link = $(l).val();
              const linkName = $(l).text();
              const linkNameRegex = regex.exec(linkName);
              console.log(linkName);
              console.log(linkNameRegex);
              if (!linkNameRegex) {
                return empty;
              }
              const acronym = linkNameRegex[1].toUpperCase();
              const name = linkNameRegex[2];
              return {link, name, acronym};
            });
          const array2 = Object.keys(data2)
            .filter(k => Number(k) >= 0)
            .map(k => data2[k]);
          const courses = []
            .concat(array1, array2)
            .filter(i => i.link)
            .filter(i => ignore.indexOf(i.acronym) === -1);
          console.log('courses');
          console.log(courses);
        });
      });
    });
  }
}

module.exports = Portal;
