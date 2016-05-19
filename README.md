# glauncher

![Build Status](https://img.shields.io/travis/salakar/glauncher.svg)
![Coverage](https://img.shields.io/coveralls/salakar/glauncher.svg)
![Downloads](https://img.shields.io/npm/dm/glauncher.svg)
![Downloads](https://img.shields.io/npm/dt/glauncher.svg)
![npm version](https://img.shields.io/npm/v/glauncher.svg)
![dependencies](https://img.shields.io/david/salakar/glauncher.svg)
![dev dependencies](https://img.shields.io/david/dev/salakar/glauncher.svg)
![License](https://img.shields.io/npm/l/glauncher.svg)

Automatically boots your node app on google cloud compute instances using the startup script meta.

This can be configured to pull the latest git changes from a specified branch, run npm install and then execs the app start script.

Useful for Google Cloud load balanced instances that automatically scale. 

## Getting Started

Install it via npm:

```shell
npm install glauncher
```

And include in your project:

```javascript
import glauncher from 'glauncher';
```

## License

MIT
