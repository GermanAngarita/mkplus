'use strict'

const Others = require('../models/others')
const Parts = require('../models/parts')

function createOthers(req, res){
    const other = new Others({
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        setBudget:false
    })
    
    other.save( (err)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al crear el Tercero', err:err})
        res.status(200).send({msg:'El tercero se ha creado con exito'})
    } )
}

function getOthers(req, res){
    Others.find({}, (err, others)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al obtener los Terceros', err:err})
        res.status(200).send(others)
    })
}

function updateOthers(req, res){
    let id = req.body._id
    Others.findByIdAndUpdate(id, req.body, (err)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al actualizar los Terceros', err:err})
        res.status(200).send({msg:'Se ha actualizado con exito'})
    })
}

function deletOthers(req, res){
    let id = req.body._id
    Others.findByIdAndRemove(id, req.body, (err)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al eliminar los Terceros', err:err})
        res.status(200).send({msg:'Se ha borrado con exito'})
    })
}

// Funciones relacionadas con las partes

function createParts(req, res){
    const parts = new Parts({
        ref: req.body.name,
        name: req.body.name,
        other: req.body.idResponsable
    })

    parts.save( (err)=>{
        if(err) return res.status(500).send({msg:'Error al crear las partes', err:err})
        res.status(200).send({msg:'Se ha creado la parte'})
    } )
}

function getPartsByIdResponsable(req, res){
    Parts.aggregate([
        { $group:{
            _id:{other:"$other", name:"$name", id:"$_id"}
        } },
        { $group:{
            _id:"$_id.other",
            parts:{ $push:{
                name:"$_id.name",
                _id:"$_id.id"
            }}
        }}
    ], (err, parts)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las partes', err:err})
        res.status(200).send(parts)
    })
}

function deletParts(req, res){
    let id = req.body._id

    Parts.findByIdAndRemove(id, (err)=>{
        if(err) return res.status(500).send({msg:'Error al eliminar la parte', err:err})
        res.status(200).send({msg:'Se ha eliminado con exito'})
    })
}




module.exports = {
    createOthers,
    getOthers,
    updateOthers,
    deletOthers,
    createParts,
    deletParts,
    getPartsByIdResponsable
}