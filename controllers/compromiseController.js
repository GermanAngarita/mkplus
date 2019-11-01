'use strict'
const nodemailer = require('nodemailer')
const Compromise = require('../models/compromise')
const moment = require('moment')
const mailerCont = require('./mailerController')

let transporter = mailerCont.transporter

function taskSendReminder(){
    if(moment().day(0).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY') || moment().day(6).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY')){
        // nothing to do...
    } else if(moment(5).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY')){
        if( (moment().format('h a') == '8 am') && (parseInt(moment().format('m')) == 20)) {
            sendReminder(2, 6)
            sendExpire(2)
        }
    }else {
        if( (moment().format('h a') == '8 am') && (parseInt(moment().format('m')) == 20)) {
            sendReminder(2, 3)
            sendExpire(1)
        }
    }
}
setInterval(taskSendReminder, 60000)

function sendEmail(data, eTitle, event){
    let status = 'En progreso';
    let priority ='';
    let to = 'kasc@kia.com.co; ';
    let title = eTitle;
    
    if(data.priority == 'alta'){
        
        priority = '<span style="color:red; border-color:red; border-radius: 30px; border-style:solid; border-width:1px; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;"> Alta Prioridad </span>'
    } else if(data.priority == 'normal') {
        priority = '<span style="color:#17a2b8; border-color:#17a2b8; border-radius: 30px; border-style:solid; border-width:1px; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;"> Prioridad Normal </span>'
    } else {
        priority = '<span style="color:#6c757d; border-color:#6c757d; border-radius: 30px; border-style:solid; border-width:1px; padding-left:10px; padding-top:10px; padding-right:10px; padding-bottom:10px;"> Prioridad Baja </span>'
    }
    // Set to
    for(let i of data.responsables){
        to = i.email+'; '+to;
        data.sended.push({
            email:i.email,
            date: new Date(),
            event:event
        })
    }
    
    const mailOptions = {
        from:'Kia After Sales Consulting <kasc@kia.com.co>',
        to: to,
        subject:`[KASC] Notificación de compromiso: ${data.category}`,
        text: `Este es un aviso de un compromiso `,
        html:`<!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content=" initial-scale=1.0"/>
            <meta charset="UTF-8">
            <title>[KASC] Notificación Compromiso</title>
        </head>
        <body bgcolor="#eee" style="margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
         
            <table bgcolor="#fff" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="margin-top:15px; border-collapse: collapse;">
                <tr bgcolor="#343a40" >
                    <td align="right" style="padding-bottom:5px; padding-top:5px; padding-right:5px;">
                        <a href="" style="font-size:0.6em; font-family: Arial, sans-serif; color:#eeeeee; text-decoration:none;">Metrokia S.A. | Importadora</a>
                    </td>
                </tr>
                <tr bgcolor="#fff">
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
                <tr bgcolor="#fff" align="center">
                    <td style="font-family: Arial, sans-serif;">
                        <br>
                        <p>${title}</p>
                        <small>____ _ ____</small>
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" >
                    <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                        <br>
                        <h3 style="color:#212529; text-transform: capitalize;">${data.category}: ${data.item}</h3>
                        <br>
                        ${priority}
                        <br> <br>
                        <p style="color:#6c757d"><em> ${data.text}</em></p>
                        <span style="color:#6c757d"> <small>Fecha Objetivo</small> <br>
                            ${data.date}
                        </span> <br>
                        <small>____ _ ____</small>
                    </td>
                </tr>
                <tr bgcolor="#fff">
                   <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;">
                        <table  border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="font-family: Arial, sans-serif;" width="260" valign="top" align="center">
                                    <small style="color:#6c757d">Creado por:</small> <br>
                                    ${data.user}
                                </td>
                                <td style="font-family: Arial, sans-serif; font-size: 0; line-height: 0;" width="20">
                                   &nbsp;
                                </td>
                                <td style="font-family: Arial, sans-serif;" width="260" valign="top" align="center">
                                    <small style="color:#6c757d">Area responsable:</small> <br>
                                    ${data.dealer}: ${data.area}
                                </td>
                            </tr>                  
                        </table>
                   </td>
                </tr>
                <tr align="center" bgcolor="#fff">
                    <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr align="center">
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                <td width="260" bgcolor="#6c757d" style="color:#fff; padding-left:15px; padding-right:15px; padding-top:15px; padding-bottom:15px;">
                                    <span style="font-family: Arial, sans-serif; font-size: 18px;">${status}</span>
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
        </html>`
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
function newCompromise(req, res){
    const compromise = new Compromise({
        date: req.body.date,
        dealer: req.body.dealer,
        periodo: req.body.periodo,
        priority: req.body.priority,
        category: req.body.category,
        item: req.body.item,
        text: req.body.text, 
        area: req.body.area,
        user: req.body.user,
        sended:[],
        responsables: req.body.responsables
    })
    compromise.save( (err)=>{
        if(err) return res.status(500).send({msg:'lo sentimos ocurrio un error al crear la categoria', err:err})
        if(sendEmail(compromise, 'Notificación de Nuevo Compromiso', 'new'))  return res.status(200).send({msg:'Genial, se ha creado la categoria y se envio el emal'})
        res.status(200).send({msg:'Genial, se ha creado la categoria sin la notificacion'})
    })
}
function editCompromise(req, res){
    let id = req.body._id;
    let body = req.body;
    Compromise.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar el compromiso', err:err})
        res.status(200).send({msg:'El compromiso se ha actualizado con exito'})
    })
}
function getCompromiseByTMOG(req,  res){
    let dealer=req.body.dealer;
    let periodo= req.body.periodo;
    let status=req.body.status;
    Compromise.find({dealer:dealer, status:status }, (err, compromise)=>{
        if(err) return res.status(500).send({msg:'Error al consultar los compromisos', err:err})
        res.status(200).send(compromise)
    }).sort({date:1})
}
function getCompromiseByEvaluation(req, res){
    let dealer=req.body.dealer;
    let periodo=req.body.periodo;
    Compromise.find({dealer:dealer, periodo:periodo}, (err, compromise)=>{
        if(err) return res.status(500).send({msg:'Error al consultar los compromisos', err:err})
        res.status(200).send(compromise)
    })
}
function getKpiCompromise(req, res){
    let dealer=req.body.dealer;
    let periodo= req.body.periodo;
    let status=req.body.status;
    Compromise.aggregate([
        { $match: { dealer:dealer }},
        { $group: {
            _id:{ status:"$status" },
            total:{ $sum:1}
        }},
        { $project:{
            _id:0,
            status:"$_id.status",
            total:"$total"
        }}
    ], (err, kpi)=>{
        if(err) return res.status(500).send({msg:'Error al obtener el KPI de los compromisos', err:err})
        if(kpi && kpi.length){
            let acc=0
            for(let i of kpi){
                acc += i.total
            }
        }
        res.status(200).send(kpi)
    })
}
function getCopromiseByDealer(req, res){
    let dealer = req.body.dealer;
    let priority = req.body.priority;
    let status = req.body.status;
    let skip = req.body.skip;
    let users = req.body.users;

    Compromise.aggregate([
        { $match: { dealer:{ $in:dealer }}},
        { $match: { priority:{ $in:priority }}},
        { $match: { status: { $in:status }}},
        { $match: { user: { $in:users } }},
        { $skip:skip },
        { $limit:10 }
    ], (err, compromise)=>{
        if(err) return res.status(500).send({msg:'Error al consultar los compromisos', err:err})
        res.status(200).send(compromise)
    })
}
function getCompromiseCount(req, res){
    let dealer = req.body.dealer;
    let priority = req.body.priority;
    let status = req.body.status;

    Compromise.count({
        dealer:{ $in:dealer },
        priority:{ $in:priority },
        status: { $in:status }
    }, (err, compromise)=>{
        if(err) return res.status(500).send({msg:'Error al consultar los compromisos', err:err})
        res.status(200).send({count:compromise})
    })
}
function sendReminder(from, to){
    let today = moment().add(from,'days').format('YYYY-MM-DD')
    let endDay = moment().add(to,'days').format('YYYY-MM-DD')

   Compromise.aggregate([
       { $match: { status:'Progress'}},
       { $match: { date:{ $gte:new Date(today)} }},
       { $match: { date:{ $lte:new Date(endDay)} }}
   ] , (err, compromise)=>{
       if(err) return console.info(`Ocurrió un error al consultar los compromisos ${err}`)
       if(compromise && compromise.length>0){
           for(let i of compromise){
                sendEmail(i, 'Recordatorio: Compromiso Próximo a vencer', 'reminder')
           }
       }
   })
}   
function sendExpire(to){
    let today = moment().format('YYYY-MM-DD')
    let endDay = moment().add(to, 'day').format('YYYY-MM-DD')

    Compromise.aggregate([
        { $match: { status:'Progress'}},
        { $match: { date:{ $gte:new Date(today)} }},
        { $match: { date:{ $lte:new Date(endDay)} }}
    ], (err, compromise)=>{
        if(err) return console.info(`Ocurrió un error al consultar los compromisos ${err}`)
        if(compromise && compromise.length>0){
            for(let i of compromise){
                sendEmail(i, 'Compromiso se ha vencido y aún no tiene respuesta', 'expire')
            }
        }
    })
}
function getUserFilter(req, res){
    Compromise.distinct("user", (err, users)=>{
        if(err) return res.status(200).send({msg:'Ocurrio un error al consultar el filtro de usuario', err:err})
        res.status(200).send(users)
    })
}
module.exports = {
    newCompromise,
    editCompromise,
    getCompromiseByTMOG,
    getKpiCompromise,
    getCompromiseByEvaluation,
    getCopromiseByDealer,
    sendReminder,
    getCompromiseCount,
    getUserFilter
    
}