'use strict'
const moment = require('moment');
moment.locale('es-ES');
const Dealer = require('../models/dealer')
const Team = require('../models/team')

const Category = require('../models/tmogCategory')
const Item = require('../models/tmogItem')
const TMOG = require('../models/tmog') //Modelo de las respuestas item a item
const Evaluation = require('../models/evaluationTMOG')
const Answer = require('../models/tmog')
const fs = require('fs')
const multer = require('multer')
const mongoose = require('mongoose')
const mailerCont = require('./mailerController')


let transporter = mailerCont.transporter
let dealers = [];
let memberTeam = []

function getDealer (req, res, next){
    Dealer.aggregate([
        { $project:{
            _id:0,
            cl:"$dealer_cod",
            av:"$subname_dealer",
            name:"$name_dealer",
            dealer:"$name_dealer"
        }}
    ], (err, dealer)=>{
        if(err) return res.status(500).send({message:`Error al consultar los dealers`})
        dealers = dealer
        next()
    })
}

function getMemberTeam(req, res, next){
    memberTeam = []
    let dealer = [req.body.dealer];
    Team.find({code_dealer:{$in:dealer}, reportReception:true}, (err, team)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los miebros del equipo', err:err})
        memberTeam = team;
        next()
    })
    
}

function createCategory(req, res){
    const category = new Category({
        weight: req.body.weight,
        code: req.body.code,
        category: req.body.category,
        description: req.body.description,
        version: req.body.version,
        newItem: req.body.newItem,
        order: req.body.order
    })
    category.save((err)=>{
        if(err) return res.status(500).send({msg:'Error al crear la categoria', err:err})
        res.status(200).send({msg:'Genial la categoria se ha creado con exito'})
    })
}
function upDateCategory(req, res){
    let id = req.body._id
    let update = req.body
    let updateitem = {
        category_weight: req.body.weight,
        version: req.body.version,
        code_category: req.body.code,
        category:req.body.category
    }
    Category.findByIdAndUpdate({_id:id}, update, (err, success)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al actualizar la categoria'})
        
        Item.find({id_category:mongoose.Types.ObjectId(id)}, (err, items)=>{
            if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al aplicar el cambio a los items de la categoría', err:err})
           
            if(items && items.length>0){
                let index = 0
                for(let i of items){
                    index = index +1
                    Item.findByIdAndUpdate(i._id, updateitem,(err)=>{
                        if(err) return res.status(500).send({msg:'Error al actualizar uno de los registros', err:err})
                        
                    })
                    if(index == items.length-1){
                        res.status(200).send({msg:`Se han actualizado ${index} registros`})
                    }
                }
                // res.status(200).send({msg:'Actualizados'})
            }else {
                res.status(200).send({msg:'Aún no hay elementos que actualizar'})
            }
        })

    })
}
function deletCategory(req, res){
    let id = req.body._id
    Category.findByIdAndRemove(id, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al Eliminar la categoria', err:err})
        res.status(200).send({msg:'la categoría ha sido borrada con exito'})
    })
}
function getCategoryByVersion(req, res){
    let version = req.body.version
    Category.aggregate([
        { $match:{ version:version }},
        { $sort: { order:1 }}
    ], (err, categorys)=>{
        if(err) return res.status(500).send({msg:'Error al consultar las categorias', err:err})
        res.status(200).send(categorys)
    })
}
function getVersionFilter(req, res){
    Category.aggregate([
        { $group:{
            _id:{ version:"$version"},
            kpi:{ $sum:"$weight"}
        }},
        { $project: {
            _id:0,
            version:"$_id.version",
            weight:"$kpi"
        }}
    ],(err, version)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al obtener las versiones de categoria'})
        res.status(200).send(version)
    })
}

// Item Functions

function createItem(req, res){
    const item = new Item({
        item: req.body.item,
        description: req.body.description,
        code: req.body.code,
        weight: req.body.weight,
        category_code: req.body.category_code,
        category_weight:req.body.category_weight,
        version: req.body.version,
        answer_options: req.body.answer_options,
        order: req.body.order,
        id_category:req.body.id_category,
        code_category:req.body.code_category,
        category:req.body.category,
        crateUp: req.body.crateUp,
        target: req.body.target,
        result: req.body.result,
        fulfillment:0,
        seeFulfillment:true
    })
    item.save( (err)=>{
        if(err) return res.status(500).send({msg:'Error al guardar el item', err:err})
        res.status(200).send({msg:'El item se ha guardado con exito'})
    })
}
function getItemsVersion(req, res){
    let version = req.body.version
    Item.aggregate([
        { $match: { version:version }},
        { $sort: {order:1 }}
    ], (err, items)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los items', err:err})
        res.status(200).send(items)
    })
}
function updateItem(req, res){
    let id = req.body._id
    let update = req.body
    Item.findByIdAndUpdate(id, update, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al Actualizar el item', err:err})
        res.status(200).send({msg:'El item se ha actualizado'})
    })
}
function getItemToQuestionaire(req, res){
    let version = req.body.version
    const valueIni = 0;
    Item.aggregate([
        { $match: { version:version}},
        { $group:{
            _id:{ category:"$category", category_weight:"$category_weight",
            code:"$code",
            weight:"$weight",
            item:"$item",
            description:"$description",
            code_category:"$code_category",
            order:"$order",
            answer_options:"$answer_options",
            version:"$version",
            target:"$target",
            result:"$result",
            fulfillment:"$fulfillment",
            seeFulfillment:"$seeFulfillment"
         }
        }},
        { $group:{
            _id:{category:"$_id.category", category_weight:"$_id.category_weight", code_category:"$_id.code_category"},
            questions:{ $push:{
                user:"",
                dealer:"",
                date:"",
                code:"$_id.code",
                weight:"$_id.weight",
                target:"$_id.target",
                result:"$_id.result",
                fulfillment:{ $sum:0 },
                seeFulfillment:"$_id.seeFulfillment",
                item:"$_id.item",
                description:"$_id.description",
                code_category:"$_id.code_category",
                version:"$_id.version",
                order:"$_id.order",
                answer:"n/a",
                id:"",
                comment:[],
                files:[],
                compromises:[],
                answer_options:"$_id.answer_options"
            }}
        }},
        { $project:{
            _id:0,
            category:"$_id.category",
            code_category:"$_id.code_category",
            weight:"$_id.category_weight",
            value: { $sum:0 },
            questions:"$questions"
        }}
    ], (err, items)=>{
        if(err) return res.status(500).send({msg:'Error al consultar el cuestionario', err:err})
        res.status(200).send({evaluation:items, assistants:[], status:false})
    })
}
function createDirDealer(dealer){
    let dirname = './uploads/tmog/'+dealer+'/';
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
            cb(null, './uploads/tmog/'+req.body.dealer+'/');
        },
        filename: (req, file, cb)=>{
          const datetimetamp = Date.now();
          name = req.body.dealer+req.body.code+req.body.category+'-'+datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1];
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
    let path = req.body.url.split('https://app.kia.com.co:3001/')
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

//Evaluations Functions
function saveTMOGEvaluation(req, res, next){
    let periodo = req.body.periodo;
    let dealer = req.body.dealer;
    let evaluation = req.body.evaluation;
    let assistants =req.body.assistants;
    let evaluation_status = req.body.status;

    Evaluation.find({dealer:dealer, period:periodo}, (err, evaluation)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrio un error al consultar las evaluaciones', err:err})
        if(evaluation && evaluation.length>0){
            let id = evaluation[0]._id
            let status = evaluation[0].status
            let body = { evaluation:req.body.evaluation, result:req.body.result, assistants:assistants, status:evaluation_status, completed: new Date( Date.now()) }
            if(status){
                return res.status(200).send({msg:'La evaluación finalizó, estos cambios no pueden aplicarse'})
            }
            Evaluation.findByIdAndUpdate(id, body, (err, success)=>{
                if(err) return res.status(500).send({msg:'Error al actualizar la evaluación, vuelva a intentarlo', id:id, err:err})
                if(evaluation_status){
                    sendEmail(req.body, id, 'Resultados TMOG', 'Envio Resultado TMOG')
                }
                res.status(200).send({msg:'Genial, la evaluación se ha actualizado con exito', memberTeam:memberTeam}) 
                
            })
        } else {
            const newEvaluation = new Evaluation({
                dealer: req.body.dealer,
                result: req.body.result,
                period: req.body.periodo,
                staff: req.body.staff,
                assistants: req.body.assistants,
                evaluation: req.body.evaluation,
                status:false,
                completed: new Date( Date.now())
            })
            newEvaluation.save( (err)=>{
                if(err) return res.status(500).send({msg:'Error al guardar la evaluación, vuelva a intentarlo', err:err})
                res.status(200).send({msg:'Genial, la evaluación se ha guardado con exito', memberTeam:memberTeam})
            })
        }
    })
}

function getTMOGQuestionarie(req, res, next){
    let dealer = req.body.dealer;
    let period = req.body.periodo;
    Evaluation.find({dealer:dealer, period:period}, (err, data)=>{
        if(err) return res.status.send({msg:'Lo sentimos, ocurrio un error al consultar esta evaluación', err:err})
        if(data && data.length>0){
            
            res.status(200).send(data[0])
        } else {
           
            next()
        }
    })
}

function createTMOGAsnwer(req, res){
    let dealer = req.body.dealer;
    let date = req.body.date;
    let code = req.body.code;
    let code_category = req.body.code_category;
    // 1. Buscar si este TMOG aún no se ha creado
    TMOG.find({dealer:dealer, date:date, code:code, code_category:code_category}, (err, tmog)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrio un error al consultar el TMOG', err:err})
        if(tmog && tmog.length>0){
            let id = tmog[0]._id
            let body = req.body
            //Hay que hacer un Update
            TMOG.findByIdAndUpdate(id, body, (err, success)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos ocurrio un error al actualizar este TMOG', err:err})
                res.status(200).send({msg:'TMOG Actualizado'})
            })
        } else {
            //Save
            if(isNaN(req.body.answer)){
                req.body.answer = ''
            }
            const newTMOG = new TMOG({
                user: req.body.user,
                dealer: req.body.dealer, 
                date: req.body.date,
                code: req.body.code,
                weight: req.body.weight,
                item: req.body.item,
                version: req.body.version,
                description: req.body.description,
                code_category: req.body.code_category,
                order: req.body.order,
                answer: req.body.answer,
                id: req.body.id,
                comment: req.body.comment,
                files: req.body.files,
                answer_options: req.body.answer_options,
                createdUp: req.body.createdUp,
            })
            newTMOG.save( (err)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos error al guardar el registro TMOG', err:err})
                res.status(200).send({msg:'TMOG Guardado'})
            })
        }
    })
   
}

function getTMOGEvaluation(req, res){
    let periods = req.body.periods
 
    Evaluation.aggregate([
        { $match: { status:true }},
        { $match: { period: {$in:periods} }},
        { $group:{
            _id:{ dealer:"$dealer", period:"$period", result:"$result", id:"$_id"},
        }},
        { $group:{
            _id:"$_id.dealer",
            avg:{ $avg:"$_id.result"},
            evaluation:{ $push: {
                period:"$_id.period",
                result:"$_id.result",
                id:"$_id.id"
            }}
        }},
        
        { $project: {
            _id:0,
            cl:"$_id",
            av:"",
            avg:"$avg",
            evaluation:"$evaluation"
        }}
    ], (err, evaluation)=>{
        if(err) return res.status(500).send({msg:'Error al consular los resultados', err:err})
        
        if(evaluation && evaluation.length>0){
            for(let i of dealers){
                for(let j of evaluation){
                    if(i.cl == j.cl){
                        j.av = i.av
                    }
                }
            }
            evaluation.sort( (a, b)=>{
                if(a.av > b.av){
                    return 1;
                }
                if(a.av < b.av){
                    return -1
                }
                return 0
            })
            for(let i of evaluation){
                i.evaluation.sort( (a, b)=>{
                    if(a.period > b.period){
                        return 1;
                    }
                    if(a.period < b.period){
                        return -1
                    }
                    return 0
                })
            }
            res.status(200).send(evaluation)
        } else {
            res.status(200).send(evaluation)
        }
    })
}

function getEvaluationById(req, res){
    let id = req.body.id
    Evaluation.findById(id, (err, result)=>{
        if(err) return res.status(500).send({msg:'Error al obtener la evaluación'})
        res.status(200).send(result)
    })
}


function getGlossary(req, res){
    Item.aggregate([
        { $project:{
            code:"$code",
            item:"$item",
            des:"$description"
        } }
    ], (err, glossary)=>{
        if(err) return res.status(500).send({msg:'Error al obtener el glosario', err:err})
        res.status(200).send(glossary)
    })
}

function getGlossaryCategory(req, res){
    Category.aggregate([
        { $project:{
            code:"$code",
            category:"$category"
        }}
    ], (err, glossary)=>{
        if(err) return res.status(500).send({msg:'Error al obtener el glosario', err:err})
        res.status(200).send(glossary)
    })
}

function sendEmail(data, id, eTitle, event){
    let status = 'En progreso';
    let priority ='';
    let to = 'mtkingdespos@gmail.com; ';
    let title = eTitle;
    let result = Math.round(data.result*10000)/100;
    for(let i of memberTeam){
        to += i.email+'; '
    }

    // Cambio dinámico de la imagen de la calificación
    if(data.result<0.25){
        // D
        priority = '<span align="center" style="font-weight: bold; font-size: 64px; font-weight: 900; color:#dc3545; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;">D</span>'
    } else if(data.result>=0.25 && data.result<0.63){
        // C
        priority = '<span align="center" style="font-weight: bold; font-size: 64px; font-weight: 900; color:#ffc107; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;">C</span>'
    } else if(data.result>=0.63 && data.result < 0.88){
        // B
        priority = '<span align="center" style="font-weight: bold; font-size: 64px; font-weight: 900; color:#28a745; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;">B</span>'
    } else {
        // A
        priority = '<span align="center" style="font-weight: bold; font-size: 64px; font-weight: 900; color:#28a745; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;">A</span>'
    }
     
    const mailOptions = {
        from:'Kia After Sales Consulting <mtkingdespos@kia.com.co>',
        to: to,
        subject:`[KASC] Resultados TMOG: ${getDealerName(data.dealer).name} - ${trasformDate(data.periodo)}`,
        text: `Este es un aviso de un compromiso `,
        html:`<!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content=" initial-scale=1.0"/>
            <meta charset="UTF-8">
            <title>[KASC] Resultados TMOG</title>
        </head>
        <body bgcolor="#343a40" style="background-color: #343a40; margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
         
            <table bgcolor="#fff" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="background-color: rgb(255, 255, 255); margin-top:15px; border-collapse: collapse;">
                <tr bgcolor="#343a40" >
                    <td align="right" style="padding-bottom:5px; padding-top:5px; padding-right:5px;">
                        <a href="" style="font-size:0.6em; font-family: Arial, sans-serif; color:#eeeeee; text-decoration:none;">Metrokia S.A. | Importadora</a>
                    </td>
                </tr>
                <tr bgcolor="#fff" style="background-color:#fff">
                    <td width="100%">
                        <!-- <img width="200" height="auto" style="display: block;" src="https://app.kia.com.co/assets/logo_email.png" alt=""> -->
                        <table  border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>&nbsp;</tr>
                            <tr style="margin-top:15px;">
                                <td align="left" style="padding-left:15px;">
                                    <img width="80" height="auto" style="display: block;" src="https://app.kia.com.co/assets/logo_kasc.png" alt="">
                                </td>
                                <td align="right" style="padding-right:15px;">
                                    <img width="160" height="auto" style="display: block;" src="https://app.kia.com.co/assets/kia_promise_to_care.png" alt="">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr bgcolor="#fff" align="center" style="background-color:#fff">
                    <td style="font-family: Arial, sans-serif;">
                        <br>
                        <p>${title}-${data.periodo}</p>
                        <small>____ _ ____</small>
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" style="background-color:#fff">
                    <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                        <br>
                        <h2 style="color:#212529; text-transform: capitalize;"> ${getDealerName(data.dealer).name} </h2>
                        <p style="color:#212529; text-transform: capitalize;">${getDealerName(data.dealer).ab}</p>
                        <h3 style="color:#212529; text-transform: capitalize;">Código distribuidor: ${data.dealer} </h3>
                        
                        <br>
                        ${priority}
                        <br><br>
                        <p style="color:#6c757d"><em> ${result} %</em></p>
                        <span style="color:#6c757d;  text-transform: capitalize;"> <small>Evaluado por:</small> <br>
                            ${data.staff.toUpperCase()}
                        </span> <br>
                        <small>____ _ ____</small>
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" style="background-color:#fff">
                    <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr align="center">
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                <td width="260" bgcolor="#dc3545" style="color:#fff; padding-left:15px; padding-right:15px; padding-top:15px; padding-bottom:15px;">
                                    <!-- <span style="font-family: Arial, sans-serif; font-size: 18px;">${status}</span> -->
                                    <a style="font-family: Arial, sans-serif; color:#f8f9fa; text-decoration:none;" href="https://app.kia.com.co/#/tmog/result/${id}">
                                        Ver Evaluación
                                    </a>
                                </td>
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr bgcolor="#343a40">
                    <td style="font-size:12px; color:rgb(180, 180, 180); padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;">
                        <span style="font-family: Arial, sans-serif; font-size:12px;">
                            <strong>Metrokia S.A</strong> Posventa Importadora <br> 
                            <strong>D</strong> Calle 224 No. 9 - 60, <strong>T</strong> 364 9700 Ext 1264 <strong>E</strong> <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a> <br>
                            <small>Bogotá D.C. – Colombia</small>
                        </span> <br> <br>
                        <span style="font-family: Arial, sans-serif; text-align:justify; color:rgb(131, 130, 130);">
                            <small>
                                Este correo y cualquier archivo anexo pertenecen a METROKIA S.A. y son para uso exclusivo del destinatario intencional. 
                                Esta comunicación puede contener información confidencial o de acceso privilegiado. Si usted ha recibido este correo por 
                                error, equivocación u omisión favor notificar en forma inmediata al remitente y eliminar dicho mensaje con sus anexos. 
                                La utilización, copia, impresión, retención, divulgación, reenvió o cualquier acción tomada sobre este mensaje y sus 
                                anexos queda estrictamente prohibido y puede ser sancionado legalmente.         <strong>¡Yo también soy Cero Papel!</strong>
                            </small>
                        </span>
                    </td>
                </tr>
            </table>
        
        </body>
        </html>
        `
    }

    transporter.sendMail(mailOptions, (err, info)=>{
        if(err) return console.info('Error al enviar el correo: '+err)
        if(data._id){ 
            Compromise.findByIdAndUpdate(data._id, data, (err, success)=>{
                if(err) return console.info('Error al actualizar el sended de compromisos')
            })
         }
        return true
    })
    
}

function getDealerName(cl){
    let dealer = {
        name:'',
        ab:''
    }
    for(let i of dealers){
        if(i.cl == cl){
            dealer.name = i.name;
            dealer.ab = i.av;
            return dealer;
        }
    }
}

function trasformDate(dateForm){ 
    let date = { year:'', month:''}
    date.year = moment(dateForm+'01', 'YYYYMMDD').format('YYYY');
    date.month = moment(dateForm+'01', 'YYYYMMDD').format('MMM');
    return (date.month +' '+date.year);
}

module.exports = {
    createCategory,
    upDateCategory,
    deletCategory,
    getCategoryByVersion,
    getVersionFilter,
    // Function Items
    createItem,
    getItemsVersion,
    updateItem,
    getItemToQuestionaire,

    uploadFile,
    deleFile,
    createDirDealer,
    saveTMOGEvaluation,
    getTMOGQuestionarie,

    createTMOGAsnwer,
    getTMOGEvaluation,
    getDealer,
    getEvaluationById,
    getMemberTeam,
    getGlossary,
    getGlossaryCategory
}