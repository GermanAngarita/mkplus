module.exports = {
    port: process.env.PORT || 3001,
    db: process.env.MONGODB || 'mongodb://localhost/27017', 
    SECRET_TOKEN: 'mysecret'
}


// module.exports = {
//     port: process.env.PORT || 5000,
//     db: process.env.MONGODB || 'mongodb://heroku_kbw1v3zm:9jb9gq505ao51fmuevoh70j7j9@ds139964.mlab.com:39964/heroku_kbw1v3zm', 
//     SECRET_TOKEN: 'mysecret'
// }


