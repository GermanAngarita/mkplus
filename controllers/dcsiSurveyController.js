'use stric'

const DcsiSurvey = require('../models/dcsi_survey')
const moment = require('moment')

function getSurveys (req, res){
    let survey_cod = req.body.survey_cod
    DcsiSurvey.aggregate([
        { $match: { survey_cod:survey_cod} },
        { $group:{
            _id:{  
                survey_cod:"$survey_cod",  
                from:"$survey_validity_from", 
                to:"$survey_validity_to",
                dcsi:"$cod_dcsi",
                short:"$short",
                long:"$long",
                class:"$class",
                order:"$order",
                question:"$dcsi",
                class_question:"$class_question",
                type_answer:"$type_answer",
                id:"$_id"
            }
        }},
        { $project:{
            _id:0,
            id:"$_id.id",
            survey_cod:"$_id.survey_cod",  
            survey_validity_from:"$_id.from", 
            survey_validity_to:"$_id.to",
            cod_dcsi:"$_id.dcsi",
            short:"$_id.short",
            long:"$_id.long",
            class:"$_id.class",
            order:"$_id.order",
            dcsi:"$_id.question",
            class_question:"$_id.class_question",
            type_answer:"$_id.type_answer"
        }},
        { $sort:{ order:1 }}
    ], (err, surveys)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las encuestas'})
        res.status(200).send(surveys)
    })
}

function newQuestion(req, res){
    const question = new DcsiSurvey({
        survey_cod: req.body.survey_cod,
        survey_validity_from: req.body.survey_validity_from,
        survey_validity_to: req.body.survey_validity_to,
        short: req.body.short,
        long: req.body.long,
        cod_dcsi: req.body.cod_dcsi,
        dcsi: req.body.dcsi,
        class: req.body.class,
        order: req.body.order,
        class_question: req.body.class_question,
        interviewer: req.body.interviewer,
        type_answer: req.body.type_answer,
        comments: req.body.comments
    })

    question.save( (err)=>{
        if(err) return res.status(500).send({msg:'Error al crear la Pregunta', err:err})
        res.status(200).send({msg:'La pregunta se ha creado con exito', question:question})
    })
}

function updateQuestion(req, res){
    let id = req.body.id
    let update = req.body
    DcsiSurvey.findByIdAndUpdate(id, update, (err)=>{
        if(err) return res.status(500).send({msg:'Error al acutalziar la pregunta', err:err})
        res.status(200).send({msg:'La pregunta se ha actualizado con éxito'})
    })
}

function getSurveyList(req, res){
    DcsiSurvey.aggregate([
        { $group:{
            _id:{ cod:"$survey_cod"}
        }},
        { $project:{
            _id:0,
            cod:"$_id.cod"
        }}
    ], (err, list)=>{
        if(err) return res.status(500).send({msg:'Error al consultar el listado', err:err})
        res.status(200).send(list)
    })
}

function deletQuestion(req, res){
    let id = req.body.id
    DcsiSurvey.findByIdAndRemove(id, (err)=>{
        if(err) return res.status(500).send({msg:'Error al Eliminar el listado', err:err})
        res.status(200).send({msg:'Genial Se ha borrado con exito'})
    })
}

module.exports = {
    getSurveys,
    newQuestion,
    getSurveyList,
    updateQuestion,
    deletQuestion
}


// survey_validity_from:{ type:Date },
// survey_validity_to:{ type:Date },
// short:{ type:Boolean },
// long: {type:Boolean },
// cod_dcsi:{type:String, maxlength:5, minlength:5, unique:true},
// dcsi:{ type:String },
// class:{ type:String },
// order:{ type:Number},
// class_question:{ type:String },
// interviewer:{ string:String },
// type_answer:{ string:String },
// comments: {string:String },