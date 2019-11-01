'use strict'

const Variable = require('../models/variables');

function create(req, res){
    const variable = new Variable({
        name: req.body.name,
        value: req.body.value,
        description: req.body.description,
        createUp: new Date( Date.now() ), 
        update: new Date( Date.now() ),
    })
    variable.save( (error)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:'Se ha creado una nueva variable'})
    } )
}

function getVariable(req, res){
    let active=req.body.active
    Variable.find({active:active}, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(result)
    })
}

function updateVariable(req, res){
    let id = req.body.id;
    let body = req.body
    Variable.findByIdAndUpdate(id, body, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:'Se ha actualizado la variable'})
    })
}

function deletVariable(req, res){
    let id = req.body.id;
    Variable.findByIdAndRemove({_id:id}, (error, result)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:'Se ha eliminado la variable'})
    })
}

module.exports = {
    create,
    getVariable,
    updateVariable,
    deletVariable
}

