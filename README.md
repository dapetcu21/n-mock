# n-mock

A middleware for express or connect to generate mock data.

Why use this module?

  - Build a bridge between Frontend and Backend
  - This allows for parallel development


## Install

```bash
npm install n-mock
```

## Usage

You can use this middleware with express or connect

### if express

```javascript
var express = require('express');
var mock = require('n-mock');

var app = express();
app.use(mock(__dirname + '/mocks'));
app.listen(3000);
```

### if connect

```javascript
var connect = require('connect');
var mock = require('n-mock');

var app = connect();
app.use(mock(__dirname + '/mocks'));
app.listen(3000);
```
### in your project dir

4
4
4
4
