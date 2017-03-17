const warning = msg => {
  const warning = `
--- WARNING
      ${msg}

  Please report this problem here
    https://github.com/open-source-uc/webcursinc/issues
-----
  `
  console.log(warning)
}

module.exports = warning
