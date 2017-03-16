# Webcursinc

[![npm version](https://badge.fury.io/js/webcursinc.svg)](https://badge.fury.io/js/webcursinc)

Webcursinc allows you to download the files from uc webcurso in an easy way

You must have [node](https://nodejs.org) installed to use it

Install with
```
# with yarn:
yarn global add webcursinc

# with npm:
npm install -g webcursinc
```

And then just run
```
webcursinc
```

Or if you want to just update your files quickly you can run
```
webcursinc sync
```

On the first run you will be prompted for credentials
```json
{
  "username": "Your uc username without @uc",
  "password": "Your uc password",
  "path": "The absolute path to the folder where you want to download the siding folders and files",
  "ignore": "Space separated acronyms of courses you don't want to download. Usefull for those who are assistants. (example: IIC2154 IIC1103)"
}
```
The credentials are stored in your Home directory on `.webcursinc/data.json`

***

Let's see it in action  
![demo](https://github.com/open-source-uc/webcursinc/blob/assets/demo.gif)

***

## Development

Clone the repo
```
git clone https://github.com/open-source-uc/webcursinc.git
```

Install dependencies
```node
# with yarn:
yarn

# with npm:
npm i
```

To test you have two options
```
# run from project folder
node index.js

# or link it to run it from everywhere
npm link
webcursinc
```

Check the [contributing guide](https://github.com/open-source-uc/webcursinc/blob/dev/CONTRIBUTING.md)
