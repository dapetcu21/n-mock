# n-mock
Setup a mock server easily.

Why use this module?
- Build a bridge between Frontend and Backend
- This allows for parallel development

## Usage

To use n-mock, you has two choices: Cli or Middleware.

### Use as command line

#### Step 1 : install globally.

```
$ npm install -g n-mock
```

#### Step 2 : create mock json file
After create a server, you can add some json file to mocks dir, for example:

```bash
my-project
├── app.js
├── mocks
│   ├── users
│   │   ├── 1.GET.response.200.json
│   │   ├── 1.GET.response.401.json
│   │   └── 2.GET.response.200.json
│   ├── users.GET.response.200.json
│   ├── users.POST.request.json
│   ├── users.POST.response.200.json
│   ├── users.POST.response.422.json
│   └── users.PUT.response.200.json
└── package.json
```

#### Step 3 : start mock server

```
$ cd my-project/mocks
$ n-mock --baseDir .
```

And boom!！ You will see something in you browser.


###  Use as A middleware for Node.js (browser-sync、express、 connect).

#### Step 1 : create a server
**if browser-sync**

```javascript
var mock = require('n-mock');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
    baseDir: './',
    middleware: [
      mock(__dirname + '/mocks')
    ]}
  });
});
```

**if express**

```javascript
var express = require('express');
var mock = require('n-mock');

var app = express();
app.use(mock(__dirname + '/mocks'));
app.listen(3000);
```

**if connect**

```javascript
var connect = require('connect');
var mock = require('n-mock');

var app = connect();
app.use(mock(__dirname + '/mocks'));
app.listen(3000);
```

#### Step 2 : create mock json file
After create a server, you can add some json file to mocks dir, for example:

```bash
my-project
├── app.js
├── mocks
│   ├── users
│   │   ├── 1.GET.response.200.json
│   │   ├── 1.GET.response.401.json
│   │   └── 2.GET.response.200.json
│   ├── users.GET.response.200.json
│   ├── users.POST.request.json
│   ├── users.POST.response.200.json
│   ├── users.POST.response.422.json
│   └── users.PUT.response.200.json
└── package.json
```

#### Step 3 : enjoy it
After start your server, you can use it.

**For example 1 :**

`curl -i http://localhost:9999/users?_status=200` will get response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Date: Mon, 27 Jul 2015 16:23:34 GMT
Connection: keep-alive
Transfer-Encoding: chunked

[{
  "id": 1,
  "name": "foo",
  "email": "foo@gmail.com",
}, {
  "id": 2,
  "name": "bar",
  "email": "bar@gmail.com",
}]
```

`_status=200` mean that you get a response with http status code 200. By default, `_status` equal to `200`. so, `curl http://localhost:9999/users` will get a collect response too.

**For example 2 :**

`curl -X POST http://localhost:9999/users?_status=422` will get response:

```bash

HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json;charset=UTF-8
Date: Mon, 27 Jul 2015 16:22:45 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
  "code" : 1234,
  "description" : "bad email format"
}
```

You can see the Complete Example:
- [use with browser-sync](https://github.com/forsigner/n-mock-with-browser-sync)
- [use with connect](https://github.com/forsigner/n-mock-with-connect)
- [use with express](https://github.com/forsigner/n-mock-with-express)
