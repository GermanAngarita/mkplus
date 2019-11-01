'use strict'

const Prepaid = require('../models/prepaid');

function create(req, res){
    const prepaid = new Prepaid({
        mto: req.body.mto, 
        offPartsImp: req.body.offPartsImp, 
        offPartsCon: req.body.offPartsCon, 
        offPartsTotal: parseFloat(req.body.offPartsImp) + parseFloat(req.body.offPartsCon), 
        hours: req.body.hours, 
        createUp: new Date(Date.now()), 
        active: req.body.active
    })

    prepaid.save( (error)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:"Creado con exito"})
    } )
}

function getPrepaidTemplates(req, res){
    Prepaid.find({active:true}, (error, prepaids)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(prepaids)
    })
}

function updatePrepaidTemplates(req, res){
    let id = req.body.id;
    let body = req.body
    Prepaid.findByIdAndUpdate(id, body, (error, success)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:"Actualizado con exito"})
    })
}

function getTemplateForSimulator(req, res){
    Prepaid.aggregate([
        { $group:{
            _id:{ routine:"$mto", offPartsImp:"$offPartsImp", offPartsCon:"$offPartsCon", offPartsTotal:"$offPartsTotal", hours:"$hours" }
        }},
        { $project:{
            _id:0,
            routine:"$_id.routine",
            offPartsImp:"$_id.offPartsImp",
            offPartsCon:"$_id.offPartsCon",
            offPartsTotal:"$_id.offPartsTotal",
            hours:"$_id.hours"
        }}
    ], (error, template)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(template)
    })
}

module.exports = {
    create,
    getPrepaidTemplates,
    updatePrepaidTemplates,
    getTemplateForSimulator
}