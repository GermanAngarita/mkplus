'use strict'

const Model = require('../models/model')
const fs = require('fs')
const multer = require('multer')

function newModel(req, res){
    const model = new Model({
        model: req.body.model,
        description: req.body.description,
        sixDigit: req.body.sixDigit,
        img: req.body.img
    })

    Model.findOne({
        sixDigit:model.sixDigit
    }, (err, find)=>{
        if(err) return res.status(500).send({message:`Error al comprobar el Modelo ${err}`})
        if(!find){
            const model = new Model({
                model: req.body.model,
                description: req.body.description,
                sixDigit: req.body.sixDigit,
                img: req.body.img
            })
            model.save((err)=>{
                if(err) return res.status(500).send({message:`Error al guardar el modelo: ${err}`})
                res.status(200).send({message:`Modelo Guardado`})
            })
        } else {
            return res.status(200).send({message:`El modelo ya existe`})
        }
    })

    
}

function getModels(req, res){
    Model.find({}, (err, models)=>{
        if(err) return res.status(500).send({message: `Error al consultar los datos ${err}`})
        if(!models) return res.status(404).send({messge:`No hay Modelos disponibles`})
        return res.status(200).send(models)
    })
}

function deletModel(req, res){
    let model_id = req.params._id
    Model.findByIdAndRemove(model_id, (err, delet)=>{
        if(err) return res.status(500).send({message:`Error al borrar el modelo ${err}`})
        if(delet){
            
            fs.unlink(`./uploads/models/${delet.img}`, (err)=>{
                if(err) return res.status(200).send({message:`Error al borrar la imagen ${err}`})
                res.status(200).send({message:'Modelo borrado'})
            })
        }
        
    })
}

function uploadImg(req, res){
    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
          cb(null, './uploads/models/');    
        // cb(null, 'http://www.test.mibbu.com/uploads/models/')
        },
        filename: (req, file, cb)=>{
          const datetimetamp = Date.now();
        //   cb(null, file.filename+'-'+datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1]);
        cb(null, req.body.model +'-'+req.body.vin+'.jpg')
          
        }
      });

      const upload = multer({
        storage: storage
      }).single('file');
    
      upload(req, res, (err)=>{
          if(err) return res.status(500).send({error_code:1, err_desc:err})
          res.status(200).send({error_code:0, err_desc:null})
      })
}

function searchModel(req, res){
    let model = req.body.model
    Model.findOne({model:model}, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(result)
    })
}

function getGroupModels(req, res){
    Model.aggregate([
        { $group:{
            _id:{ model:"$model", vin:"$sixDigit"}
        }},
        { $group:{
            _id:"$_id.model",
            vin:{ $push:{
                vin:"$_id.vin",
            }}
        }},
        { $project:{
            _id:0,
            model:"$_id",
            vin:"$vin",
        }},
        { $sort:{ model:1 }}
    ],(err, model)=>{
        if(err) return res.status(500).send({message:`Error al Obtener los modelos ${err}`})
        res.status(200).send(model)
    })
}

module.exports = {
    newModel,
    getModels,
    deletModel,
    uploadImg,
    getGroupModels,
    searchModel
}