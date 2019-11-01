'use strict'

const fs = require('fs')
const multer = require('multer')

function createDirDealer(dealer){
    let dirname = './uploads/warrantys/'+dealer+'/';
    fs.mkdir(dirname, (err)=>{
        if(err && err.code == "EEXIST"){
        } else if(err){
            return res.status(500).send({msg:'Error al crear el directorio'})
        } 
       
    })
}
function uploadFile(req, res){
    let name = '';
    let originalname = '';

    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            createDirDealer(req.body.dealer)
            cb(null, './uploads/warrantys/'+req.body.dealer+'/');
        },
        filename: (req, file, cb)=>{
          const datetimetamp = Date.now();
          name = req.body.dealer+'-'+datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1];
          originalname = file.originalname
          cb(null, name);
        }
      });
      const upload = multer({
        storage: storage
      }).single('file');
      upload(req, res, (err)=>{
          if(err) return res.status(500).send({error_code:1, err_desc:err})
          res.status(200).send({error_code:0, err_desc:null, filename:name, originalname:originalname})
      })
}
function deleFile(req, res){
    let url = req.body.path;
    let path = req.body.url.split(url);
    console.log(req.body)
    fs.unlink('uploads/'+path[1], (err)=>{
        if(err && err.code == 'ENOENT') {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
            res.status(500).send({msg:'El archivo no existe o ya fue eliminado'})
        } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
            res.status(500).send({msg:'Lo sentimos un error ocurrio al eliminar el archivo', err:err})
        } else {
            console.info(`removed`);
            res.status(200).send({msg:'Borrado'})
        }
    })
}

module.exports = {
    uploadFile,
    deleFile
}