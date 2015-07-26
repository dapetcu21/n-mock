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

### in project dir

After create a server, you can add some json file to mocks dir, for example:

``` bash
my-projec
├── app.js
├── mocks
│   ├── users
│   │   ├── 1.GET.response.200.json
│   │   ├── 1.GET.response.401.json
│   │   └── 2.GET.response.200.json
│   ├── users.GET.response.200.json
│   ├── users.POST.request.json
│   ├── users.POST.response.200.json
│   ├── users.POST.response.422.json
│   └── users.PUT.response.200.json
└── package.json
```

You can see the Complete Example:

- [basic example]()
- [use with angular]()
- [use with reack]()
