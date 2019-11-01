'use strict'

const sSurvey = require('../models/serviceSurvey');
const Team = require('../models/team');
const Dealers = require('../models/dealer');
const moment = require('moment');
const mailerCont = require('./mailerController');
const request = require("request");


let transporter = mailerCont.transporter;
let receives = [];
let surveySave;
let allDealers = [];

function getDealers(req, res, next){
    Dealers.find({}, (err, dealers)=>{
        if(err) return res.status(500).send(err)
        allDealers = dealers;
        next();
    })
}

function getAbb(cl){
    for(let i of allDealers){
        if(i.dealer_cod == cl){
            return i.subname_dealer;
        }
    }
}

let scale = {
    high:90,
    medium:70,
    low:60,
    very_low:0,
} 

let allColors = {
    colors:{
        high:'#77F186',
        medium:'#F9EA2B',
        low:'#FA98AD',
        very_low:'#DF3A01',
        
    }
}

// NPS Color
function setColor(value, scale){
    // Range Alto
    if(value >= scale.high){
        return allColors.colors.high;
    // Rango Medio    
    } else if (value >= scale.medium && value < scale.high){
        return allColors.colors.medium;
    // Rango Bajo
    } else if (value >= scale.low && value < scale.medium ){
        return allColors.colors.low;
    } else {
        return allColors.colors.low
    }
} 

function createSurvey(req, res, next){
    let questions = req.body.questions;
    const newSurvey = new sSurvey({
        date: req.body.date,
        or: req.body.or,
        key: req.body.dealer + req.body.or,
        dealer: req.body.dealer,
        city: req.body.city,
        questions: req.body.questions,
        sendTo: req.body.sendTo,
        tracing: req.body.trancing,
        status:req.body.status,
        answered:true
    })

    newSurvey.save( (err)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrión un error al guardar los datos', err:err})
        let val = false;
        for(let i of questions){
            if(i.response <= 6){
                val = true;
            }
        }
        if(val){
            return next()
        } else {
            res.status(200).send({msg:'Muchas gracias por responder nuestra encuesta de servicio'})
        }
    })
}

function createSurveyToLink(req, res, next){
    let questions = req.body.questions;
    const newSurvey = new sSurvey({
        host:req.body.host,
        date: req.body.date,
        or: req.body.or,
        key: req.body.dealer + req.body.or,
        dealer: req.body.dealer,
        city: req.body.city,
        questions: req.body.questions,
        sendTo: req.body.sendTo,
        tracing: req.body.trancing,
        status:req.body.status,
        shortLink:'pendiente'
    })

    newSurvey.save( (err, success)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurró un error al crear la encuesta', err:err})
        surveySave = success;
        next()
    } )
    
}

function getSurveyById(req, res){
    let id = req.body.id;

    sSurvey.findById(id, (err, survey)=>{
        if(err) return res.status(500).send({msg:'Error al obtener la encuesta', err:err})
        res.status(200).send(survey)
    })
}

function updateSurvey(req, res, next){
    let id = req.body._id;
    let body = req.body;
    let questions = req.body.questions;
    body.dateAnswer = new Date();
    body.answered = true;
    sSurvey.findByIdAndUpdate(id, body, (err, result)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar la encuesta', err:err})
        surveySave = result;
        let val = false;
        for(let i of questions){
            if(i.response <= 6){
                val = true 
            }
        }

        if(val){
            next()
        } else {
            res.status(200).send({msg:'Gracias por responder nuestra encuesta'})
        }
    })
}

function getReceivers(req, res){
    let dealer = req.body.dealer
    Team.find({
        status:true,
        surveyAlert:true,
        code_dealer:dealer
    }, (err, result)=>{
        if(err) return console.log('Ocurrió un error al obtener los destinatarios')
        receives = result;
        if(sendMail(req.body)) {return res.status(200).send({msg:'Gracias por responder nuestra encuesta SMA'})} else { res.status(200).send({msg:'Gracias por responder nuestra encuesta'})}
    })
    
}

function sendMail(data){
    console.log('Entro a la funcion de envío de correo')
    let to = 'mtkingdespos@gmail.com; mtkingdespos@kia.com.co; ';
    for(let i of receives){
        to += i.email+'; ' 
    }
    // Cambio dinámico de la encuesta
    let survey = ''
    for(let i of data.questions){
        let color ='';

        if(i.response <= 6){
            color = '#DF3A01'
        } else if(i.response >=7 && i.response <=8){
            color = '#F9EA2B'
        } else if(i.response >=9 && i.response <= 10){
            color ='#77F186'
        }
        survey += `<tr>`+
                    `<td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px; padding-top:15px;">${i.answer}</td>`+
                    `<td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px; padding-top:15px; text-align: center">`+
                        `<span align="center" style="font-family: Arial, sans-serif; font-weight: bold; font-size: 24px; font-weight: 900; color:${color};">${i.response}</span>`+
                    `</td>`+
                `</tr>`
    }
    let date = moment(data.date).format('DD-MM-YYYY hh:mm a')



    const mailOptions = {
        from:'Kia After Sales Consulting <mtkingdespos@kia.com.co>',
        to:to,
        subject:`[KASC] Alerta cliente insatisfecho: #${data.or}`,
        text:'',
        html:`
        <!DOCTYPE html>
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
                        <p>Cliente insatisfecho con el Servicio de Posventa</p>
                        <small>____ _ ____</small>
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" style="background-color:#fff">
                    <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                        <br>
                        <h3 style="color:#212529; text-transform: capitalize;">#${data.or}</h3>
                        <small>Orden de trabajo</small>
                        <br>
                        <br>
                        <p>Resumen de la encuesta</p>
                        <table width="100%" border="1" cellpadding="0" cellspacing="0">
                            ${survey}
                        </table>
        
        
                        <br><br>
                        
                        <span style="color:#6c757d"> <small>Fecha:</small> <br>
                            ${date}
                        </span> <br>
                        <small>____ _ ____</small>
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" style="background-color:#fff">
                    <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr align="center">
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                
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
        data.sendTo = receives;
        sSurvey.findOneAndUpdate({key:data.dealer + data.or}, data, (err, success)=>{
            if(err) return console.info('Error al actualizar el sended de compromisos')
        })
        return true
    })
}

function getShortLink(req, res){
    let id = surveySave._id;
    let url = 'https://app.kia.com.co/';
    
    let linkRequest = {
        destination: `https://app.kia.com.co/#/sSurvey/${id}`,
        domain: { fullName: "kiacol.com" }
    }

    let requestHeaders = {
    "Content-Type": "application/json",
    "apikey": "00b368c07bda4efdbd77e775c93138b1"
    }

    request({
        uri: "https://api.rebrandly.com/v1/links",
        method: "POST",
        body: JSON.stringify(linkRequest),
        headers: requestHeaders
    }, (err, response, body) => {
        if(err) console.log(err);
        let link = JSON.parse(body);
        surveySave.shortLink = link.shortUrl;
        
        sSurvey.findByIdAndUpdate(id, surveySave, (err, result)=>{
            if(err) return console.log(err)
            res.status(200).send(surveySave)

        })
    })
}

//Reportes de Encuestas de servicio en el servicio
function getDealerCity(req, res){
    sSurvey.aggregate([
        { $group:{
            _id:{ dealer:"$dealer", city:"$city", send:{ $cond:[ { $ifNull:["$shortLink", false ] }, "Enviado al Cliente", "En el taller" ] } },
            total_surveys:{ $sum:1 },
            answered:{ $sum:{ $cond:[ "$answered", 1, 0 ] } },
            not_answered:{ $sum:{ $cond:[ "$answered", 0, 1 ] } }
        }},
        { $project:{
            _id:0,
            dealer:"$_id.dealer",
            city:"$_id.city",
            send:"$_id.send",
            total_surveys:"$total_surveys",
            answered:"$answered",
            not_answered:"$not_answered"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}

function getSurveysResult(req, res){ 
    let dateInit = new Date(moment(req.body.dateInit, 'YYYY/MM/DD'));
    let dateEnd =  new Date(moment(req.body.dateEnd, 'YYYY/MM/DD'));
    let dealer = [];
    let question = req.body.question; 
    if(req.body.dealer && req.body.dealer.length>0){
        dealer=[]
        for(let i of req.body.dealer){
            dealer.push(new RegExp(i))
        }
    } else {
        dealer=[ /CL/]
    } 
    let data = { labels:[], value:[], color:[], devs:[], surveys:[], devsBot:[], devsTop:[] }
    sSurvey.aggregate([
        { $match:{ date:{ $gte:dateInit, $lte:dateEnd } }},
        { $match:{ dealer:{ $in:dealer } }},
        { $unwind:"$questions"},
        // Standard
        { $group:{
            _id:{ 
                id:"$_id",
                key:"$key",
                city:"$city",
                dealer:"$dealer",
                answered:"$answered",
                notifiedStaff:{ $size:"$sendTo"},
                question:"$questions.answer", 
                answer:"$questions.response",
                date:"$date",
                shortLink:"$shortLink",
                type:{ $cond:[ { $eq:[ { $ifNull:["$shortLink", "Presencial"] }, "Presencial"]}, "Presencial", "En línea"  ]}
            }
        }},
        // Standard
        { $match:{ "_id.question":{ $in:question } }},
        { $group:{
            _id:{ 
                survey:"$_id.id", 
                date:{ $add:[{ $multiply:[ { $year:"$_id.date"}, 100 ] }, { $month:"$_id.date" }]},
                question:"$_id.question",
                answer:"$_id.answer",
                dealer:"$_id.dealer"
            },
            log:{ $sum: 1}
        }},
        { $group:{
            _id:{ dealer:"$_id.dealer",  question:"$_id.question" },
            answer:{ $avg:"$_id.answer"},
            logs:{ $sum:1 },
            devs:{ $stdDevPop: "$_id.answer" }

        }},
        { $match:{ "answer":{ $ne:null} } },
        { $project:{
            _id:0,
            dealer:"$_id.dealer",
            question:"$_id.question",
            avg:"$answer",
            logs:"$logs",
            devs:"$devs"
            
        } }
    ],(err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                data.labels.push(getAbb(i.dealer));
                data.value.push( Math.round(i.avg * 1000)/100);
                data.color.push(setColor(Math.round(i.avg * 1000)/100, scale));
                data.surveys.push(i.logs);
                data.devs.push( Math.round(i.devs * 1000)/100);
                data.devsBot.push( Math.round((i.avg - i.devs) * 1000)/100);
                data.devsTop.push( Math.round((i.devs + i.avg) * 1000)/100);
            }
        }
        res.status(200).send(data)
    })
}

function getSurveysNPS(req, res){
    let dateInit = new Date(moment(req.body.dateInit, 'YYYY/MM/DD'));
    let dateEnd =  new Date(moment(req.body.dateEnd, 'YYYY/MM/DD'));
    let dealer = [];
    let question = req.body.question; 
    if(req.body.dealer && req.body.dealer.length>0){
        dealer=[]
        for(let i of req.body.dealer){
            dealer.push(new RegExp(i))
        }
    } else {
        dealer=[ /CL/]
    } 
    let data = { labels:[], promoter:[], neutral:[], detractor:[], surveys:[] }

    sSurvey.aggregate([
        { $match:{ date:{ $gte:dateInit, $lte:dateEnd } }},
        { $match:{ dealer:{ $in:dealer } }},
        { $unwind:"$questions"},
        // Standard
        { $group:{
            _id:{ 
                id:"$_id",
                key:"$key",
                city:"$city",
                dealer:"$dealer",
                answered:"$answered",
                notifiedStaff:{ $size:"$sendTo"},
                question:"$questions.answer", 
                answer:"$questions.response",
                date:"$date",
                shortLink:"$shortLink",
                type:{ $cond:[ { $eq:[ { $ifNull:["$shortLink", "Presencial"] }, "Presencial"]}, "Presencial", "En línea"  ]}
            }
        }},
        // Standard
        { $match:{ "_id.question":{ $in:question } }},
        { $match:{ "_id.answer":{ $ne:null} } },
        { $group:{
            _id:{ dealer:"$_id.dealer"},
            promoter:{ $sum:{ $cond:[ { $gte:["$_id.answer", 9 ]}, 1, 0 ] }},
            neutral:{ $sum:{ $cond:[ {$and:[{ $gte:["$_id.answer", 7 ]}, { $lte:["$_id.answer", 8] } ]}, 1, 0 ] } },
            detractor:{ $sum:{ $cond:[ { $lte:["$_id.answer", 6] }, 1, 0 ] } },
            logs:{ $sum: 1 }
        } },
        { $project:{
            _id:0,
            dealer:"$_id.dealer",
            promoter:"$promoter",
            neutral:"$neutral",
            detractor:"$detractor",
            logs:"$logs"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                data.labels.push(getAbb(i.dealer));
                data.promoter.push( Math.round(i.promoter/i.logs * 10000)/100 );
                data.neutral.push( Math.round(i.neutral/i.logs * 10000)/100 );
                data.detractor.push( Math.round(i.detractor/i.logs * 10000)/100 );
                data.surveys.push(i.logs)
            }
        }
        res.status(200).send(data)
    })
    // res.status(200).send({result:'ok'})

}

function getQuestions(req, res){
    sSurvey.distinct('questions.answer', (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}

function surveysByDealer(req, res){ 
    
    let dateInit = new Date(moment(req.body.dateInit, 'YYYY/MM/DD'));
    let dateEnd =  new Date(moment(req.body.dateEnd, 'YYYY/MM/DD'));
    let dealer = []; 

    if(req.body.dealer && req.body.dealer.length>0){
        dealer=[]
        for(let i of req.body.dealer){
            dealer.push(new RegExp(i))
        }
    } else {
        dealer=[ /CL/]
    } 

    let data = { labels:[], surveys:[], color:[], presencial:[], onLine:[], answered:[], answeredPercent:[], notified:[] }
    sSurvey.aggregate([
        { $match:{ date:{ $gte:dateInit, $lte:dateEnd } }},
        { $match:{ dealer:{ $in:dealer } }},
        { $group:{
            _id:{ dealer:"$dealer",
            id:"$_id",
            type:{ $cond:[ { $eq:[ { $ifNull:["$shortLink", "Presencial"] }, "Presencial"]}, "Presencial", "En línea"  ]}, 
            answered:"$answered",
            city:"$city",
            notifiedStaff:{ $size:"$sendTo"} },
        } },
        { $group:{
            _id:"$_id.dealer",
            surveys:{ $sum: 1},
            presencial:{ $sum:{ $cond:[ { $eq:["$_id.type", "Presencial"]}, 1, 0] }},
            onLine:{ $sum:{ $cond:[ { $eq:["$_id.type", "Presencial"]}, 0, 1] }},
            answered:{ $sum:{ $cond:["$_id.answered", 1, 0] }},
            notified:{ $sum:"$_id.notifiedStaff" }
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                data.labels.push( getAbb(i._id) );
                data.surveys.push(i.surveys);
                data.color.push('#77F186')
                data.presencial.push(i.presencial);
                data.onLine.push(i.onLine);
                data.answered.push(i.answered);
                data.notified.push(i.notified);
                data.answeredPercent.push( Math.round( i.answered / i.surveys * 10000 )/100)

            }
            res.status(200).send(data);
        }
    })
} 
 
module.exports = {
    createSurvey,
    getReceivers,
    createSurveyToLink,
    getShortLink,
    getSurveyById,
    updateSurvey,
    getDealerCity,
    getSurveysResult,
    getSurveysNPS,
    getQuestions,
    surveysByDealer,
    getDealers
}