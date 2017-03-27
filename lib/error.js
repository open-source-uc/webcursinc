const error = (msg, context) => {
  const error = `
--- ERROR ${context}
      ${msg}

  Please report this problem here
    https://github.com/open-source-uc/webcursinc/issues
-----
  `
  console.log(error)
}

module.exports = error
