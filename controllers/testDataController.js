'use strict'
const TEST = require('../models/testData');
const DCSI = require('../models/dcsi');

function createTest(req, res){
    const test = new TEST({
        name:'Test',
        detail:'detalles',
    })

    test.save( (err)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send({msg:'Creado con exito'})
    })
}


function editTest(req, res){
    let id = req.param('id');
    let index = req.param('index')
    let setObject={};
    setObject["object.arrayOne."+index+".name"] = 333;
    // console.log(setObject)
    
    TEST.findByIdAndUpdate(id, { $set:{ 'name':'test cambiado' }, $set:setObject}, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar el test'})
        res.status(200).send(success)
    })
}

function getFrequency(req, res){
    DCSI.aggregate([
        { $match:{ cod_dcsi:"BQ010" }},
        { $group:{
            _id:{vin:"$vin"},
            count:{ $sum:1}
        }},
        { $sort:{ count:-1}},
        { $limit:10}
    ], (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar el test'})
        res.status(200).send(success)
    })
}

function getDCSI(req, res){
    let dcsi = req.param('dcsi');
    let year = req.param('year')
    let yearInit = parseInt(year) * 10000;
    let yearEnd = (parseInt(year) * 10000) + 9999;
    DCSI.find({cod_dcsi:dcsi, date:{ $gte:yearInit, $lte:yearEnd }},(err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}



module.exports = {
    createTest,
    editTest,
    getFrequency,
    getDCSI
}