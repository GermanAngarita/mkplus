'use strict'

const Kpi = require('../models/kpi')
const DCSI = require('../models/dcsi')
const Colors = require('../models/colors')

function newColor(req, res){
    let nameGroupColor = 'default';
    let body = {
        colors:{ 
            high:'#77F186',
            medium:'#F9EA2B',
            low:'#ff8617',
            very_low:'#ff6a6a'
         }
    }
    const color = new Colors({
        name: nameGroupColor,
    })
    Colors.find({name:nameGroupColor}, (err, result)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear el color', err:err})
        if(result && result.length > 0){
            Colors.findOneAndUpdate({name:nameGroupColor}, body, (err, success)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear el color', err:err})
                res.status(200).send({msg:'El color se ha creado con exito'})
            })
        } else {
            color.save( (err)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear el color', err:err})
                res.status(200).send({msg:'El color se ha creado con exito'})
            })
        }
    })
    
}

function getColors(req, res){
    Colors.find({}, (err, colors)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al obtener los colores', err:err})
        res.status(200).send(colors)
    })
}

function editColor(req, res){
    let id = req.body._id
    let body = req.body
    Colors.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al actualizar el color', err:err})
        res.status(200).send({msg:'El color se ha actualizado con exito'})
    })
}

function newKpi(req, res){
    const newKpi = new Kpi({
        code: req.body.code,
        name: req.body.name,
        computed: req.body.computed,
        description: req.body.description,
        high: req.body.high,
        medium: req.body.medium,
        low: req.body.low,
        very_low: req.body.very_low
    })

    newKpi.save( (err)=>{
        if(err) return res.status(500).send({msg:'ocurrió un error al crear este KPI', err:err})
        res.status(200).send({msg:'Se ha creado con exito'})
    })
}

function getKpi(req, res){
    Kpi.find({}, (err, kpis)=>{
        if(err) return res.status(500).send({msg:'ocurrió un error al crear este KPI', err:err})
        res.status(200).send(kpis)
    })
}

function updateKpi(req, res){
    let id = req.body._id
    let body = req.body
    Kpi.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'ocurrió un error al actualizar este KPI', err:err})
        res.status(200).send(success)
    })
}

function deletKpi(req, res){
    let id = req.body._id;
    Kpi.findByIdAndRemove(id, (err, success)=>{
        if(err) return res.status(500).send({msg:'ocurrió un error al Elimiar este KPI', err:err})
        res.status(200).send(success)
    })
}

function getDCSICodes(req, res){
    DCSI.distinct('cod_dcsi', (err, dcsi)=>{
        if(err) return res.status(500).send({msg:'ocurrió un error al obtener los códigos DCSI', err:err})
        res.status(200).send(dcsi)
    })
}

module.exports = {
    newKpi,
    getKpi,
    updateKpi,
    deletKpi,
    getDCSICodes,

    newColor,
    getColors,
    editColor
}