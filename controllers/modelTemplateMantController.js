'use strict'

const ModelTemplate = require('../models/modelTemplateMant');

function create(req, res){
    const model = new ModelTemplate({
        cl: req.body.cl, 
        cod: req.body.cod, 
        name: req.body.name, 
        vin: req.body.vin, 
        supply: req.body.supply, 
        mo: req.body.mo, 
        mto5: req.body.mto5, 
        mto10: req.body.mto10, 
        mto15: req.body.mto15, 
        mto20: req.body.mto20, 
        mto25: req.body.mto25, 
        mto30: req.body.mto30, 
        mto35: req.body.mto35, 
        mto40: req.body.mto40, 
        mto45: req.body.mto45, 
        mto50: req.body.mto50, 
        key: req.body.key, 
        createUp: new Date( Date.now() ), 
        update: new Date( Date.now() )
    })

    model.save( (error)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:'Se ha creado con exito el tamplate'})
    } )
}

function getModelTemplate(req, res){
    
    let active = req.body.active;
    let limit = req.body.itemsPerpage;
    let skip = req.body.skip;
    let dealers = req.body.dealers;
    
    ModelTemplate.find({
        active:active,
        cl:{ $in:dealers}
    }, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(result)
    })
}

function getCountModelTemplate(req, res){
    let active = req.body.active;
    let dealers = req.body.dealers;
    ModelTemplate.count({
        active:active,
        cl:{ $in:dealers }
    }, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({count:result})
    })
}

function update(req, res){
    let id = req.body.id;
    let body = req.body;
    ModelTemplate.findByIdAndUpdate(id, body, (error, success)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:'Plantilla de modelo actualizada'})
    })
}

function getModelTemplateByDealer(req, res){
    let model = req.body.model;
    let cl = req.body.cl;

    ModelTemplate.findOne({cl:cl, cod:model}, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(result)
    })
}


module.exports = {
    create,
    update,
    getModelTemplate,
    getCountModelTemplate,
    getModelTemplateByDealer
}