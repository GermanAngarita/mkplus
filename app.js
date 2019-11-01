'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('./routes')
const cors = require('cors')

// const corsOptions = {
//  origin:'https://app.kia.com.co',
//  credentials:true
// }

var whitelist = ['http://localhost:4200', 'http://localhost:3000', 'https://localhost:3001', undefined]
//var whitelist = ['http://mantenimientokplus.kia.com.co', 'https://app.kia.com.co', undefined]
var corsOptions = {
  origin: function (origin, callback) {
  	
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  //credentials:true
}

app.use(bodyParser.urlencoded({extended: false})) 
app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Methods", "POST, GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });
app.use(express.static('uploads'))

app.use('/api', api)



module.exports = app


// 'use strict'

// const express = require('express')
// const bodyParser = require('body-parser')
// const app = express()
// const api = require('./routes')
// const cors = require('cors')

// app.use(bodyParser.urlencoded({extended: false}))
// app.use(bodyParser.json())
// app.use(cors())
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://test.mibbu.com");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

// app.use('/api', api)



// module.exports = app
