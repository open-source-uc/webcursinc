# Webcursinc

[![CircleCI](https://circleci.com/gh/open-source-uc/webcursinc.svg?style=svg)](https://circleci.com/gh/open-source-uc/webcursinc)
[![npm version](https://badge.fury.io/js/webcursinc.svg)](https://badge.fury.io/js/webcursinc)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![dependencies](https://david-dm.org/open-source-uc/webcursinc.svg)](https://david-dm.org/open-source-uc/webcursinc)

[![codebeat badge](https://codebeat.co/badges/f4dde428-8e66-46ae-bef6-cbc76f9e1025)](https://codebeat.co/projects/github-com-open-source-uc-webcursinc-dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3f093249474d432e92825a14599632e0)](https://www.codacy.com/app/negebauer/webcursinc?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=open-source-uc/webcursinc&amp;utm_campaign=Badge_Grade)
[![BCH compliance](https://bettercodehub.com/edge/badge/open-source-uc/webcursinc?branch=dev)](https://bettercodehub.com/)
[![Code Climate](https://codeclimate.com/github/open-source-uc/webcursinc/badges/gpa.svg)](https://codeclimate.com/github/open-source-uc/webcursinc)
[![Test Coverage](https://codeclimate.com/github/open-source-uc/webcursinc/badges/coverage.svg)](https://codeclimate.com/github/open-source-uc/webcursinc/coverage)
[![Issue Count](https://codeclimate.com/github/open-source-uc/webcursinc/badges/issue_count.svg)](https://codeclimate.com/github/open-source-uc/webcursinc)

Webcursinc allows you to download the files from uc webcurso in an easy way

**If you aren't familiar with CLI** (command line interface) programs you should check the [video tutorial](https://github.com/open-source-uc/sincding/blob/assets/tutorial.mp4). This video tutorial is for sincding. Just change the word sincding for webcursing and you should be fine.  
If you are, just keep reading.

You must have [node](https://nodejs.org) installed to use it

Install with
```bash
# with yarn:
yarn global add webcursinc

# with npm:
npm install -g webcursinc
```

And then just run
```bash
webcursinc
```

Or if you want to just update your files quickly you can run
```bash
webcursinc sync
```

On the first run you will be prompted for credentials
- **username**: Your uc username without @uc
- **password**: Your uc password
- **path**: The absolute path to the folder where you want to download the siding folders and files
- **ignore**: Space separated acronyms of courses you don't want to download. Usefull for those who are assistants. (example: IIC2154 IIC1103)

The credentials are stored in your Home directory on `.webcursinc/data.json`

***

Let's see it in action  
![demo](https://github.com/open-source-uc/sincding/blob/assets/demo.gif)

***

## Development

Clone the repo
```bash
git clone https://github.com/open-source-uc/webcursinc.git
```

Install dependencies
```bash
# with yarn:
yarn

# with npm:
npm i
```

To test you have two options
```bash
# run from project folder
node index.js

# or link it to run it from everywhere
npm link
webcursinc
```

Check the [contributing guide](https://github.com/open-source-uc/webcursinc/blob/dev/CONTRIBUTING.md)
