const urls = {
  login: 'http://webcurso.uc.cl/direct/session',
  portal: 'http://webcurso.uc.cl/portal',
  course: c =>
    `http://webcurso.uc.cl/portal/site/${c.acronym.toLowerCase()}-${c.section}-${c.semester}-${c.year}`,
}

module.exports = urls
