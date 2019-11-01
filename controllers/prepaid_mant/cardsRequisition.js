'use strict'

const ORDER = require('../../models/orderPackage');

const mailerController = require('../mailerController');
const transporter = mailerController.transporter;
const moment = require('moment');
moment.locale('es')


function orderToReq(){
	ORDER.aggregate([
			{ $match:{ "status.2.active":true }},
			{ $match:{ cardRequisition:false }},
			{ $project:{
				_id:0,
				id:"$_id",
				vin:"$vin",
				ni:"$form.ni",
				line:"$form.modelCod",
				package:"$plan.routine",
				name:"$form.name",
				lastName:"$form.lastName",
				deliveryAddress:"$form.dealerData.address",
				deliveryCity:"$form.dealerData.city",
				deliveryDealer:"$form.dealerData.d_name",
				deliveryGroup:"$form.dealerData.group_dealer"
			}},
			{ $sort:{ deliveryCity:1 }}
		], (error, result)=>{
		if(error) return console.log(error)
			sendMail(result)
		console.log(result)
	})
}

function sendMail(data){
	let providerName = '';
	let providerAddres = '';
	let typeOrder = 'Tarjetas'
	let today = moment().format('DD-MMMM-YYYY')
	let items = '';
	if(data && data.length>0){
		for(let i of data){
			items += `
				<tr style="font-size:8px;">
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.vin}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.name}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.lastName}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.line}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.package}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.deliveryGroup}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.deliveryDealer}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.deliveryAddress}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;">${i.deliveryCity}</td>
	                <td style="font-size:8px; font-family: Arial, sans-serif;"> http://mantenimientokplus.kia.com.co/#/viewCustomer/${i.vin}/${i.ni} </td>
	            </tr>
			` 
		}
	} else {
		items = `
			<tr>
                <td colspan="10" style="text-align: center; font-family: Arial, sans-serif;">
                    NO HAY SOLICITUDES
                </td>
            </tr>
		`
	}

	let mailOptions = {
		from:'KIA Mantenimiento K Plus <kasc@kia.com.co>',
		to: 'mtkingdespos@kia.com.co; mercadeoclr@kia.com.co', //Email del proveedor
		cc:'mtkingdespos@kia.com.co; ',
		subject:`Solicitud Producción de tarjetas`,
		html:`<!DOCTYPE html>
				<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
				<head>
				    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				    <meta name="viewport" content=" initial-scale=1.0"/>
				    <meta charset="UTF-8">
				    <title>Pedido</title>
				</head>
				<body bgcolor="#eee" style="margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
				 
				    <table bgcolor="#fff" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="margin-top:15px; border-collapse: collapse;">
				        <tr bgcolor="#F6F6F6" >
				            <td align="right" style="padding-bottom:5px; padding-top:5px; padding-right:5px;">
				                <a href="" style="font-size:0.6em; font-family: Arial, sans-serif; color:#454545; text-decoration:none;">Metrokia S.A. | Importadora</a>
				            </td>
				        </tr>
				        <tr bgcolor="#fff">
				            <td width="100%"> 
				                <table  border="0" cellpadding="0" cellspacing="0" width="100%">
				                    <tr>&nbsp;</tr>
				                    <tr style="margin-top:15px;"> 
				                        </td>
				                        <td align="center" style="padding-right:15px;">
				                            <img width="100" height="auto" style="display: block;margin-bottom: 5rem; margin-top: 5rem" src="https://app.kia.com.co/assets/lg_kia.png" alt="">
				                        </td>
				                    </tr>
				                </table>
				            </td>
				        </tr>
				        <tr align="center">
				            <td style="font-size: 1rem; text-align:left; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px;">
				                <br>
				                
				                <h3>METROKIA S.A.<small></small></h3>
				                <p style="font-size: 8px">
				                    NIT. 830.078.966-6 <br>
				                    DIR. Calle 224 #9-60 <br>
				                    PBX. 3649700 - 3649700 - FAX 3710418 <br>
				                    EMAIL. ventas@kia.com.co <br>
				                    Somos Grandes Contribuyentes - Regimen Común - Somos Autoretenedores 
				                </p>
				                <table width="100%">
				                    <tr>
				                        <td style="font-size:10px; text-align:left; font-family: Arial, sans-serif;">Proveedor</td>
				                        <td style="font-size:10px; text-align:left; font-family: Arial, sans-serif;">Dirección</td>
				                        <td style="font-size:10px; text-align:left; font-family: Arial, sans-serif;">Tipo de Orden</td>
				                        <td style="font-size:10px; text-align:left; font-family: Arial, sans-serif;">Fecha</td>
				                    </tr>
				                    <tr>
				                        <td style="font-size:12px; text-transform: uppercase; text-align:left; font-family: Arial, sans-serif;">Quien vaya a hacer las tarjetas</td>
				                        <td style="font-size:12px; text-align:left; font-family: Arial, sans-serif;">Calle 1 #6-6</td>
				                        <td style="font-size:12px; text-align:left; font-family: Arial, sans-serif;">Solicitud Tarjetas</td>
				                        <td style="font-size:12px; text-align:left; font-family: Arial, sans-serif;">${today}</td>
				                    </tr>
				                    <tr>
				                        <td style="font-size:10px; text-align:left; font-family: Arial, sans-serif;">Cantidad</td>
				                        <td></td>
				                        <td></td>
				                        <td></td>
				                    </tr>
				                    <tr>
				                        <td style="font-size:10px; text-align:left; font-family: Arial, sans-serif;">${data.length}</td>
				                    </tr>
				                </table>
				            </td>
				        </tr>
				        <tr align="center" bgcolor="" >
				            <td  style="font-size: 1rem; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
				                <br>
				                <table width="100%">
				                    <tr style="font-size:10px; font-weight: bold">
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">VIN</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Nombre</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Apellido</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Línea</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Paquete</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Concesión</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Concesionario</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Enviar a</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Ciudad</td>
				                        <td style="font-size:10px; font-weight: bold; text-align:left; font-family: Arial, sans-serif;">Link QR</td>
				                    </tr>
				                    ${items}
				                </table>

				                <br> <br> <br>
				                

				                <br><br>
				                <p style="color:#6c757d; font-size: 0.8rem"><em> Si este correo es inesperado, por favor notifiquelo a <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a></em></p>
				                
				            </td>
				        </tr>
				        
				        <tr align="left" bgcolor="#fff">
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
				</html>`
	}

	transporter.sendMail(mailOptions, (error, info)=>{
		if(error) return console.log({message:'Ocurrió un error al enviar el email', error:error})
		data.map((doc)=>{
			ORDER.update({_id:doc.id}, {$set:{ 'cardRequisition':true }}).then( (result)=>{
				console.log(result)
			})
		})
	})
}

function taskRequisition(){

	if(moment().day(0).format('DDMMYYYY') === moment().format('DDMMYYYY')){
		console.log('es domingo')
	} else {
		if(moment().format('h:mm a') === '12:00 pm'){
			orderToReq();
		}		
	}
}



setInterval(taskRequisition, 60000)



module.exports = {
	orderToReq
}