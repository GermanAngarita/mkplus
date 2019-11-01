'use strict'
const nodemailer = require('nodemailer')
const User = require('../models/user')
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
        
    host:'mail.kia.com.co',
    port:325,
    secure:true,
    auth:{
        user:'kasc@kia.com.co',
        pass:'jM6O943RwN'
    },
    tls: {ciphers:'SSLv3'},
    
})

function sendEmailTest(req, res){

    // const mailOptions = {
    //     from:'Kia After Sales Consulting <mtkingdespos@kia.com.co>',
    //     to: 'mtkingdespos@kia.com.co; mtkingdespos@gmail.com',
    //     subject:'[KASC] Test Send Email',
    //     text: 'Prueba',
    //     html:'Prueba de Mensaje 10; Ultima prueba revisar el spam'
    // }

    // transporter.sendMail(mailOptions, (err, info)=>{
    //     if(err) return res.status(500).send({msg:`Ocurrió un error: ${err}`})
    //     res.status(200).send({msg:`Mensaje enviado`})
    // })
    res.status(200).send({msg:'Buena esa chamaco perro'})

    // Fin de la Prueba
}

function getNewPass(req, res){ 
    let newPassword = Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)
    let email_user = req.body.user
    let user = {
        password: ''
    }

    bcrypt.genSalt(10, (err, salt)=>{
        if(err) return res.status(500).send({msg:`Ocurrio un error al encriptar el password ${err}`})
        bcrypt.hash(newPassword, salt, null, (err, hash)=>{
            if(err) return res.status(500).send({msg:`Ocurrio un error al hashear el password ${err}`})
            user.password = hash;
            User.findOneAndUpdate({'email':req.body.email}, user, (err, getNewPass)=>{
                if(err) return res.status(500).send({message:`Ocurrio un error al actualizar el password ${err}`})
            
                const mailOptions = {
                    from:'Kia After Sales Consulting <kasc@kia.com.co>',
                    to: req.body.email,
                    subject:'[KASC] Notificación seguridad: Cambio de contraseña',
                    text: `Este es su nuevo password ${newPassword} `,
                    html:`<!DOCTYPE html>
                    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <meta name="viewport" content=" initial-scale=1.0"/>
                        <meta charset="UTF-8">
                        <title>[KASC] Notificación Cambio Contraseña</title>
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
                            <tr align="center">
                                <td style="font-family: Arial, sans-serif;">
                                    <br>
                                    <p>Notificación de cambio de contraseña</p>
                                    <small>____ _ ____</small>
                                </td>
                            </tr>
                            <tr align="center" bgcolor="" >
                                <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                                    <br>
                                    <h3 style="color:#212529; text-transform: capitalize;">${newPassword}</h3>
                                    <br>
                                    Estimado usuario, esta es su nueva contraseña, recuerde que puede cambiarla en cualquier momento, haciendo clic en las opciones en la parte superior derecha de la barra de navegación del sitio.
                                    <br> <br>
                                    <p style="color:#6c757d"><em> Si este correo es inesperado, por favor notifiquelo a <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a></em></p>
                                    
                                    <small>____ _ ____</small>
                                </td>
                            </tr>
                            
                            <tr align="center" bgcolor="#fff">
                                <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                                    <!-- <a href="https://app.kia.com.co" role="button" bgcolor="#" style="border-radius: 25px; text-decoration:none; color:#fff; width:260px; padding-top:15px; padding-bottom:15px; background-color: #bb162b; display:block; margin-top:15px; margin-bottom:15px; margin-left:15px; margin-right:15px;">
                                        <span style="font-family: Arial, sans-serif; font-size: 18px;">Inicia sesión ahora</span>
                                    </a> -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr align="center">
                                            <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                            <td width="260" bgcolor="#bb162b" style="color:#fff; padding-left:15px; border-radius: 25px; padding-right:15px; padding-top:15px; padding-bottom:15px;">
                                                <a href="https://app.kia.com.co" role="button" bgcolor="#bb162b" style=" text-decoration:none; color:#fff; background-color: #bb162b; display:block;">
                                                    <span style="font-family: Arial, sans-serif; font-size: 18px;">Inicia sesión ahora</span>
                                                </a>
                                            </td>
                                            <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr bgcolor="#343a40">
                                <td style="font-family: Arial, sans-serif; font-size:12px; color:rgb(180, 180, 180); padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;">
                                    <span style="font-size:12px;">
                                        <strong>Metrokia S.A</strong> Posventa Importadora <br> 
                                        <strong>D</strong> Calle 224 No. 9 - 60, <strong>T</strong> 364 9700 Ext 1264 <strong>E</strong> <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a> <br>
                                        <small>Bogotá D.C. – Colombia</small>
                                    </span> <br> <br>
                                    <span style="font-family: Arial, sans-serif; text-align:justify; font-size:10px; color:rgb(131, 130, 130);">
                                        Este correo y cualquier archivo anexo pertenecen a METROKIA S.A. y son para uso exclusivo del destinatario intencional. 
                                        Esta comunicación puede contener información confidencial o de acceso privilegiado. Si usted ha recibido este correo por 
                                        error, equivocación u omisión favor notificar en forma inmediata al remitente y eliminar dicho mensaje con sus anexos. 
                                        La utilización, copia, impresión, retención, divulgación, reenvió o cualquier acción tomada sobre este mensaje y sus 
                                        anexos queda estrictamente prohibido y puede ser sancionado legalmente.         ¡Yo también soy Cero Papel!
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    
                    `
                }
            
                transporter.sendMail(mailOptions, (err, info)=>{
                    if(err) return res.status(500).send({msg:`algo fallo y no que fue ${err}`})
                    res.status(200).send({msg:`Mensaje enviado`})
                })
            })
        })

    })

    
}

module.exports = {
    sendEmailTest,
    getNewPass,
    transporter
}
