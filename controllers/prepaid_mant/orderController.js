'use strict';

const ORDER = require('../../models/orderPackage');
const Users = require('../../models/user');
const moment = require('moment');
const mailerController = require('../mailerController')
const transporter = mailerController.transporter;
const fs = require('fs')
const multer = require('multer')

let emailUsers = '';
function getAdmins(req, res, next){
	emailUsers = '';
	Users.aggregate([
			{ $match:{ role:'manager' }},
			{ $match:{ servicePackAccess:true }},
			{ $group:{
				_id:'$email'
			}},
			{ $project:{
				_id:0,
				email:"$_id"
			}}
		], (error, emails)=>{
		if(error) return res.status(500).send({message:'Error al obtener los usuarios', error:error})

		if(emails && emails.length>0){
			
			emails.map( (i)=>{
				emailUsers += i.email+'; ';
			} )
			next();
		} else {
			emailUsers = 'mtkingdespos@kia.com.co';
			next();
		}
	})
}

function getOthers(req, res, next){
	emailUsers = '';
	Users.aggregate([
			{ $match:{ role:'manager' }},
			{ $match:{ servicePackAccess:true }},
			{ $group:{
				_id:'$email'
			}},
			{ $project:{
				_id:0,
				email:"$_id"
			}}
		], (error, emails)=>{
		if(error) return res.status(500).send({message:'Error al obtener los usuarios', error:error})
		if(emails && emails.length>0){
			
			emails.map( (i)=>{
				emailUsers += i.email+'; ';
			} )
			next();
		} else {
			emailUsers = 'mtkingdespos@kia.com.co';
			next();
		}
	})
}

function create(req, res){
	const order = new ORDER({
		vin:'',
		number:'',
		dealer: req.body.form.cl,
		adviser:'',
		article: req.body.article,
		form: req.body.form,
		plan: req.body.plan,
		projection: req.body.projection,
		status: [{
			status:'Creado',
			active:true,
			date:new Date( Date.now()),
			user:req.body.form.adviserId
		},{
			status:'Doc Cargados',
			active:false,
			date:'',
			user:''
		},{
			status:'Doc Verificados',
			active:false,
			date:'',
			user:''
		},{
			status:'Rechazado',
			active:false,
			date:'',
			user:''
		},{
			status:'Aprobado [No Activado]',
			active:false,
			date:'',
			user:''
		},{
			status:'Activado',
			active:false,
			date:'',
			user:''
		}],
		version: req.body.version,
		create_at: new Date( Date.now())
	})

	//validaciones
	let dForm = order.form
	if(!order.article) return res.status(500).send({message:'No se ha definido una version de vehículo'})
	if(!dForm.address) return res.status(500).send({message:'Es necesario la dirección del cliente'})
	if(!dForm.adviserId) return res.status(500).send({message:'Es necesario la Identificación del Asesor'})
	if(!dForm.adviserName) return res.status(500).send({message:'Es necesario el nombre del cliente'})
	if(!dForm.adviserTypeId) return res.status(500).send({message:'Por favor complete tipo de idenficación del asesor'})
	if(!dForm.bill) { bill:'Pendiente' }
	if(!dForm.city) return res.status(500).send({message:'Por favor completa el campo Ciudad'})
	if(!dForm.email) return res.status(500).send({message:'Por favor complete el email del cliente'})
	if(!dForm.lastName) return res.status(500).send({message:'Por favor complete el apellido del cliente'})
	if(!dForm.modelCod) return res.status(500).send({message:'Por favor complete el código de modelo'})
	if(!dForm.modelColor) return res.status(500).send({message:'Por favor escriba el color del vehículo'})
	if(!dForm.modelVersion) return res.status(500).send({message:'Por favor escriba la version del vehículo'})
	if(!dForm.modelYear) return res.status(500).send({message:'Por favor complete el año modelo del vehículo'})
	if(!dForm.name) return res.status(500).send({message:'Por favor complete el nombre del cliente'})
	if(!dForm.ni) return res.status(500).send({message:'Por favor complete el número de identificación del cliente'})
	if(!dForm.packageName) return res.status(500).send({message:'Aún no se ha asignado el código de paquete'})
	if(!dForm.packageValue) return res.status(500).send({message:'No Se ha seleccionado un valor de paquete'})
	if(!dForm.telephone) return res.status(500).send({message:'Por favor complete el número de teléfono del cliente'})
	if(!dForm.typeId) return res.status(500).send({message:'Elija el tipo de identificación del cliente'})
	if(!dForm.vin || dForm.vin.length!==17) return res.status(500).send({message:'Por favor escriba el VIN, recuerde que debe contener 17 caracteres'})
	
	order.adviser = dForm.adviserId;
	order.vin = dForm.vin;

	//Generate Number

	ORDER.count({dealer:req.body.form.cl}, (error, result)=>{
		if(error) return res.status(500).send({error:error, message:'Ocurrio un error al crear el pedido'})
		order.number = req.body.form.cl + dForm.vin.slice(11,17) +'-'+ (parseInt(result)+10000).toString();
		order.save( (error)=>{
		if(error) return res.status(500).send({error:error, message:'Ocurrio un error al crear el pedido'})
		res.status(200).send({message:'Se ha creado el pedido con exito'})	
	} )
	})
}

function getOrders(req, res){
	let dealer = []
	if(req.body.dealer && req.body.dealer.length>0){
		req.body.dealer.map( (item)=>{
			dealer.push( new RegExp(item))
		})
	}
	let dateTo = new Date(req.body.dateTo);
	let dateFrom = new Date(req.body.dateFrom);
	let vin = new RegExp(req.body.vin, 'i');
	let ni = new RegExp(req.body.ni, 'i');
	ORDER.aggregate([
			{ $match:{ create_at:{ $gte:dateFrom, $lte:dateTo }}},
			{ $match:{ dealer:{ $in:dealer} }},
			{ $match:{ "form.vin":vin }},
			{ $match:{ "form.ni":ni }},
			{ $project:{
				_id:1,
				number:"$number",
				create:"$create_at",
				dealer:"$dealer",
				model:"$form.modelCod",
				plan:"$plan.routine",
				planValue:"$plan.pAccumulated",
				status:"$status",
				vin:"$form.vin",
				ni:"$form.ni"


			}}
		], (error, orders)=>{
		if(error) return res.status(500).send({error:error, message:"Ocurrió un error al obtener las ordenes de pedido, por favor inténtelo nuevamente"})
		res.status(200).send(orders)
	})
}

function getOrderById(req, res){
	let id = req.body.id;
	ORDER.findById({_id:id}, (error, order)=>{
		if(error) return res.status(500).send({error:error, message:'Lo sentimos, ocurrió un error al obtener la order'})
			res.status(200).send(order)
	})
}

function createDirDealer(dealer){
    let dirname = './uploads/mantpre/'+dealer+'/';
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
    let dealer = req.query.dealer;
    let title = req.query.title;
    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            createDirDealer(dealer)
            cb(null, './uploads/mantpre/'+dealer+'/');

        },
        filename: (req, file, cb)=>{
          const datetimetamp = Date.now();
          name = dealer+'-'+title+'-'+datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1];
          originalname = file.originalname;
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

function upDateOrder(req, res){
	let id = req.body._id;
	let body = req.body;

	if(body.attach && body.attach.length>0 && !body.status[2].active){
		let form = false; //Formulario
		let vehicleOrder = false; //Orden del vehículo
		let packageBill = false; //Comprobante de pago del paquete de mantenimiento
		let vehicleOrderBill = false; //Factura del pago del vehículo o separación
		let documentId = false; //Cédula de ciudadania o identificación del cliente
		let agreement = false; // acuerdo cargado

		for(let i of body.attach){
			if(i.title === 'form'){ form = true; };
			if(i.title === 'vehicleOrder'){ vehicleOrder = true; };
			if(i.title === 'packageBill'){ packageBill = true; };
			if(i.title === 'vehicleOrderBill'){ vehicleOrderBill = true; };
			if(i.title === 'documentId'){ documentId = true; };
			if(i.title === 'agreement'){ agreement = true; };
		}
		if(form && packageBill && documentId){
			for(let i of body.status){
				if(i.status === 'Doc Cargados'){
					i.active = true;
					i.user = 'System';
					i.date = new Date( Date.now())
				}
			}
		}
	}

	if(body.status[1].active && !body.status[2].active){

		let form = false; //Formulario
		let vehicleOrder = false; //Orden del vehículo
		let packageBill = false; //Comprobante de pago del paquete de mantenimiento
		let vehicleOrderBill = false; //Factura del pago del vehículo o separación
		let documentId = false; //Cédula de ciudadania o identificación del cliente
		let agreement = false; // acuerdo cargado

		for(let i of body.attach){
			if(i.title === 'form' && i.response.status === 'Verificado'){ form = true; };
			if(i.title === 'vehicleOrder' && i.response.status === 'Verificado'){ vehicleOrder = true; };
			if(i.title === 'packageBill' && i.response.status === 'Verificado'){ packageBill = true; };
			if(i.title === 'vehicleOrderBill' && i.response.status === 'Verificado'){ vehicleOrderBill = true; };
			if(i.title === 'documentId' && i.response.status === 'Verificado'){ documentId = true; };
			if(i.title === 'agreement' && i.response.status === 'Verificado'){ agreement = true; };
		}
		if(form && packageBill && documentId){
			for(let i of body.status){
				if(i.status === 'Doc Verificados'){
					i.active = true;
					i.user = 'System';
					i.date = new Date( Date.now())

					body.status[4].active = true;
					body.status[4].user = 'System';
					body.status[4].active = new Date( Date.now());
				}
			}
		}
	}

	if(body.status[2].active){
		let agreement = false; // acuerdo cargado
		for(let i of body.attach){
			if(i.title === 'agreement' && i.response.status === 'Verificado'){ agreement = true; };
		}
		if(agreement){
			body.status[5].active = true;
			body.status[5].user = 'System';
			body.status[5].date = new Date( Date.now());

			if(!body.sendedEmail){
				sendEmailAlls(body); // Correo de bienvenida
				body.sendedEmail = true;
			}
			
		}
	}

	if(body.status[5].active){
		body.projection.map( (i, index)=>{
			if(index == 0){
				i.expirationDate = moment(body.activationDate).add(1, 'year').format()
			} else if(index>0){
				if(body.projection[index-1].dateRedeem){
					i.expirationDate = moment(body.projection[index-1].dateRedeem).add(1, 'year').format()
				} else {
					i.expirationDate = moment(body.projection[index-1].expirationDate).add(1, 'year').format()
				}
			}
		} )
	}


	ORDER.findByIdAndUpdate({_id:id}, body, (error, success)=>{
		if(error) return res.status(500).send({message:'Ocurrió un error al actualizar la orden', error:error})
		res.status(200).send({message:'Se han guardado los cambios'})
	} )
}

function searchOrderByVin(req, res){
	ORDER.findOne({'form.vin':req.body.vin}, (error, order)=>{
		if(error) return res.status(500).send({message:'error al obtener la orden', error:error})
		if(order){
			if(!order.status[5].active && order.status[2].active ){
				return res.status(200).send(order)
			} else if(!order.status[2].active){
				return res.status(500).send({message:'Aún no se han cargado y/o validado los soportes', noFind:true})
			} else {
				return res.status(500).send({message:'Este paquete ya ha sido activado', noFind:true})
			}
			
		} else {
			return res.status(500).send({message:'No se encontró este VIN', noFind:true})
		}
	})
}



//Plantilla de correo de Bienvenida
function sendEmailAlls(order){
	
	let name = order.form.name;
	let plan = order.plan.routine;
	let activationDate = moment(order.activationDate).format('DD-MM-YYYY');
	let expirationDate = moment(order.expirationDate).format('DD-MM-YYYY');
	let vin = order.vin;
	let plate = order.form.plate;
	let ni = order.form.ni;
	let emailCustomer = order.form.email;


	let mailOptions = {
		from:'KIA Mantenimiento K Plus <kasc@kia.com.co>',
		to:`${emailCustomer}`,
		subject:'Bienvenido a Matenimiento K Plus',
		html:`<!DOCTYPE html>
				<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
				<head>
				    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				    <meta name="viewport" content=" initial-scale=1.0"/>
				    <meta charset="UTF-8">
				    <title>Bienvenida</title>
				</head>
				<body bgcolor="#eee" style="margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
				 
				    <table bgcolor="#fff" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="margin-top:15px; border-collapse: collapse;">
				        <tr bgcolor="#fff">
				            <td width="100%"> 
				                <table  border="0" cellpadding="0" cellspacing="0" width="100%">
				                    <tr> 
				                        <td align="center">
				                            <img width="640px" height="auto" style="display: block; max-width: 665px;" src="https://app.kia.com.co/assets/kplus/headermailing.png" alt="">
				                        </td>
				                    </tr>
				                </table>
				            </td>
				        </tr>
				        <tr align="center" width="625px">
				            <td style="font-size: 1rem; text-align:left; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px;">
				                <br>
				                
				                <h3 style="color:#454545; font-family: Arial, Helvetica, sans-serif;">Bienvenido ${name}  <br>
				                    <small>Sabes tomar buenas decisiones</small>
				                </h3>
				                <p style='color:#666666; text-align: justify; font-family: Arial, sans-serif;'>
				                    METROKIA S.A. representante de Kia Motors en Colombia le da la bienvenida a nuestra
				                    red de Centros de Servicio Posventa en Colombia. Expresamos a usted y su familia nuestros más sinceros agradecimientos por la confianza depositada
				                    en nuestra organización y nuestra marca.
				                </p>
				                <br>
				            </td>
				        </tr>
				        <tr align="center" bgcolor="" width="625px">
				            <td  style="font-size: 1rem; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
				                
				                <p style="text-align:justify; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#999999;">
				                    Usted cuenta con un Plan de Mantenimiento Prepagado
				                </p>
				            </td>
				        </tr>
				        
				        <tr align="left" bgcolor="#fff" width="625px">
				            <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
				                <table border="0" cellpadding="0" cellspacing="0" width="640">
				                    <tr style='background-color:#F6F6F6'>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">PAQUETE</td>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${plan} K</td>
				                    </tr>

				                    <tr style='background-color:#F6F6F6'>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">RUTINAS INCLUIDAS</td>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${plan/5} </td>
				                    </tr>

				                    <tr style='background-color:#F6F6F6'>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">ACTIVACIÓN</td>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${activationDate} </td>
				                    </tr>

				                    <tr style='background-color:#F6F6F6'>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; color:#454545; font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 14px;">FECHA EXPIRACIÓN</td>
				                        <td style="padding-top:5px; padding-bottom: 5px; padding-left:5px; padding-right:5px; font-family: Arial, Helvetica, sans-serif;">${expirationDate} </td>
				                    </tr>
				                </table>
				            </td>
				        </tr>

				        <tr align="center" bgcolor="" width="625px">
				            <td  style="font-size: 1rem; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
				                
				                <p style="text-align:justify; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#999999;">
				                    Redención
				                </p>

				                <p style='color:#666666; text-align: justify; font-family: Arial, sans-serif;'>
				                    Puede acercarse a cualquiera de los concesionarios autorizados por la marca Kia para Colombia, para mayor información consulte nuestra: 
				                    <a style="color:#bb162b; text-decoration: none; font-weight:bold" href="https://www.kia.com/co/service/service-care/location.html">RED CONCESIONARIOS</a>
				                </p>
				            </td>
				        </tr>

				        <tr align="center" bgcolor="" width="625px">
				            <td  style="font-size: 1rem; font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
				                
				                <p style="text-align:justify; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#999999;">
				                    Información sobre el Plan
				                </p>

				                <p style='color:#666666; text-align: justify; font-family: Arial, sans-serif;'>
				                    Puede consultar información sobre su plan de Mantenimiento Prepagado en nuestro sitio exclusivo para clientes
				                    <a style="color:#bb162b; text-decoration: none; font-weight:bold" href="http://mantenimientokplus.kia.com.co/#/viewCustomer/${vin}/cutomer">Mantenimiento K Plus</a>
				                </p>
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
		if(error) return console.log({message:'Ocurrió un error al enviar el email', error:error})
		console.log({message:'Se ha enviado el email'})
	})
}




module.exports = {
	create,
	getAdmins,
	getOrders,
	getOrderById,
	uploadFile,
	upDateOrder,
	searchOrderByVin
}