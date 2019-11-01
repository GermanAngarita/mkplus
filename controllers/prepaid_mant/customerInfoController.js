'use strict'

const Order = require('../../models/orderPackage');
const mailerController = require('../mailerController');
const transporter = mailerController.transporter;
const Dealer = require('../../models/dealer');
const Users = require('../../models/user');
const moment = require('moment');

let allDealers = [];
let allUsers = [];

function getDealers(req, res, next){
    Dealer.find({}, (error, dealers)=>{
        if(error) return res.status(500).send({msg:'Error al obtener los distribuidores', status:500, error:error})
        allDealers = dealers;
        next();
    })
}

function getDealerName(code){
    let dealername = 'Distribuidor'
    for(let i of allDealers){
        if(i.dealer_cod == code){
            dealername =  i.name_dealer
        }
    }
    return dealername;
}

function getUsers(req, res, next){
    let role = ['dealers_manager', 'manager']
    Users.find({}, (error, users)=>{
        if(error) return res.status(500).send({msg:'Error al obtener los usuarios', error:error})
        allUsers = users;
        next();
    })
}

//function createA (){}

function getDataForCustomer(req, res){
	let vin = req.query.vin;
	let plate = req.query.plate;
	let id = req.query.id
	let objectSearch = {}
	
	if(!vin){
		vin = new RegExp('', 'i')
	} else if(!plate){
		plate = new RegExp('', 'i')
	}
		console.log('vin', vin)
		console.log('plate', plate)
		console.log('id', id)
	Order.aggregate([

		{ $match:{ vin:vin }},
		{ $match:{ 'form.plate':plate }},
		{ $match:{ 'form.ni':id }}

		], (error, order)=>{
		if(error) return res.status(500).send({status:500, msg:'Error al obtener la información', error:error})
		if(order && order.length>0){
			res.status(200).send({status:200, data:order[0] })
		} else {
			res.status(200).send({status:401, msg:'El vin/placa o la contraseña no son válidas'})
		}
	})
}

function getOrderToCustomer(req, res){
	let vin = req.query.vin;
	let ni = req.query.ni
	if(!vin || vin.length !== 17){
		return res.status(200).send({status:401, msg:'Escribe un vin válido'})
	}
	Order.findOne({ vin:vin, 'form.ni' : ni }, (error, order)=>{
		if(error) return res.status(500).send({status:500, msg:'Error al obtener la información', error:error})
		if(order){
			res.status(200).send({status:200, data:order})
		} else {
			res.status(200).send({status:401, data:order})
		}
		
	})
}


function redeemNotification(req, res){
	
	let order = req.body.order;
	let routineSelect = req.body.routine;

	let name = order.form.name;
	let date = moment(routineSelect.dateRedeem).format('DD-MM-YYYY h:mm a');
	let routine = routineSelect.routine * 1000
	let km = routineSelect.kilometers;
	let kiaOnTimeLink = routineSelect.kiaOnTimeLink;
	let dealer = getDealerName(routineSelect.dealer);
	let valueToRedeem = routineSelect.valueToRedeem;
	let userName = routineSelect.userName;
	let userLastName = routineSelect.userLastName;
	console.log(routineSelect)

	let mailOptions = {
		from:'KIA Mantenimiento K Plus <kasc@kia.com.co>',
		to:`${order.form.email}; ${routineSelect.customerEmail}`,
		subject:`K Plus Reporte redención: Rutina ${routineSelect.routine*1000} KM`,
		text:`Se ha redimido una rutina ${routineSelect.routine*1000}`,
		html:`<!DOCTYPE html>
                <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <meta name="viewport" content=" initial-scale=1.0"/>
                    <meta charset="UTF-8">
                    <title>Notificación Redención</title>
                </head>
                <body bgcolor="#eee" style="margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
                 
                    <table bgcolor="#fff" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="margin-top:15px; border-collapse: collapse;">
                        <!-- <tr bgcolor="#F6F6F6" >
                            <td align="right" style="padding-bottom:5px; padding-top:5px; padding-right:5px;">
                                <a href="" style="font-size:0.6em; font-family: Arial, sans-serif; color:#454545; text-decoration:none;">Metrokia S.A. | Importadora</a>
                            </td>
                        </tr> -->
                        <tr bgcolor="#fff">
                            <td width="100%"> 
                                <table  border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center">
                                            <img width="640px" height="auto" style="display: block; max-width: 640px;" src="https://app.kia.com.co/assets/kplus/headermailing.png" alt="">
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr align="center" width="100%">
                            <td style="font-size: 1rem; text-align:left; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px;">
                                <br>
                                
                                <h3 style="color:#454545; font-family: Arial, Helvetica, sans-serif;"><small>Estimado</small><br> ${name} </h3>
                                <h4 style='color:#454545; text-align: left'>
                                        La Rutina ${routine} km ha sido Redimida
                                </h4>
                                <br>
                            </td>
                        </tr>
                        <tr align="center" bgcolor="" width="100%">
                            <td  style="font-size: 1rem; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                                
                                <p style="text-align:justify; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#999999;">
                                    Información sobre la redención:
                                </p>
                                

                                <!-- <br><br>
                                <p style="color:#6c757d; font-size: 0.8rem"><em> Si este correo es inesperado, por favor notifiquelo a <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a></em></p> -->
                                
                            </td>
                        </tr>
                        <tr width="100%">
                            <td style="padding-left:16px; padding-right:15px; padding-bottom: 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Fecha</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${date}</td>
                                    </tr>
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Rutina</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${routine}</td>
                                    </tr>
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Kilometraje</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${km}</td>
                                    </tr>
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Link Kia On Time</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;"> <a href="${kiaOnTimeLink}">${kiaOnTimeLink}</a> </td>
                                    </tr>
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Concesionario</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;"> ${dealer} </td>
                                    </tr>
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Valor redimido</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;"> $${Math.round(valueToRedeem)} </td>
                                    </tr>
                                    <tr style='background-color:#F6F6F6'>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">Asesor de servicio</td>
                                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;"> ${userName} ${userLastName} </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <tr align="left" bgcolor="#fff" width="100%">
                            <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                                
                            </td>
                        </tr>
                        <tr bgcolor="#F6F6F6">
                            <td style="font-family:Kia-medium, Arial, sans-serif; text-align:justify; font-size:12px; color:rgb(180, 180, 180); padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;">
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
                </html>` }
	transporter.sendMail(mailOptions, (error, info)=>{
		if(error) return res.status(500).send({msg:'Error al enviar el mensaje', error:error, status:500})
		res.status(200).send({msg:`Se ha enviado una notificación de redención`, status:200, })
	})
}

function somethingNotGood (req, res){
    let dealer = req.body.dealer;
    let text = req.body.text;

}


module.exports = {
    getDealers,
    getUsers,
	getDataForCustomer,
	getOrderToCustomer,
	redeemNotification
}