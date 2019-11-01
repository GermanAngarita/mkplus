'use strict'

const VIN = require('../models/vin');
const moment = require('moment');
const Tickets = require('../models/ticket');

const currentVersion = [
                        "JA1M10__25G1002", 
                        "JA1M11__25G1002", 
                        "JA1M23__25G1201", 
                        "JA1A23__25G1201", 
                        "JA1M43__25G1200", 
                        "JA1A43__25G1200", 
                        "JA1M61__25G1200", 
                        "JA1A61__25G1200", 
                        "JA1M70__25G1200", 
                        "JA1A70__25G1200", 
                        "JA1M63__25G1200", 
                        "JA1A63__25G1200", 
                        "JA1M72__25G1200", 
                        "JA1A72__25G1200", 
                        "AB--1D1P24MG14A", 
                        "AB--1D1P24AG14A", 
                        "SC1M21__24G1400", 
                        "SC1A21__24G1400", 
                        "SC1M41__24G1400", 
                        "SC1A41__24G1400", 
                        "SC1M52__24G1400", 
                        "SC1A52__24G1400", 
                        "SC1M21__25G1400", 
                        "SC1A21__25G1400", 
                        "SC1M41__25G1400", 
                        "SC1A41__25G1400", 
                        "SC1M52__25G1400", 
                        "SC1A52__25G1400", 
                        "BD1M52__24G1600", 
                        "BD1A52__24G1600", 
                        "BD1A60__24G1600", 
                        "JF--1Z1P24AH20A", 
                        "PS2M20__25G1600", 
                        "PS2A20__25G1600", 
                        "PS2A55__25G1600", 
                        "ST1M40__25G1600", 
                        "ST1A40__25G1600", 
                        "DE1A31__25H1600", 
                        "DE1A36__25H1600", 
                        "DE1A51__25H1600", 
                        " DE2A31__25H1600 ", 
                        "DE2A51__25H1600 ", 
                        "RP2M41__25G2000", 
                        "RP2A41__25G2000", 
                        "YP1A20__25G3300", 
                        "YP1A50__25G3300", 
                        "QL2M17__25G2002", 
                        "QL2A17__25G2002", 
                        "QL2M20__25G2001", 
                        "QL2A20__25G2001", 
                        "QL2A21__25G2001", 
                        "QL2A44__25G2001", 
                        "QL2A46__25G2000", 
                        "QL2A62__25G2000", 
                        "QL2A62__45G2000", 
                        "QL2A62__45D2000", 
                        "QL2A70__25G2000", 
                        "QL2A70__45G2000", 
                        "UM2A45__45G3301", 
                        "UM2A65__45G3301"
                    ]

let dataVin = {}

function getFilterModels(req, res){
    VIN.aggregate([
        { $match:{ year:2020}},
        { $match:{ use_type:"PARTICULAR"}},
        { $group:{
            _id:{ cod:{ $substr:["$article", 0, 2]}, name:"$article_description", article:"$article" }
        }},
        { $group:{
            _id:"$_id.cod",
            names:{ $push:{
                name:"$_id.name",
                article:"$_id.article"
            }}
        }},
        { $project:{
            _id:1,
            cod:"$_id",
            name:"$names"
        }}
    ], (error, filter)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send(filter)
    })
}

function getAvailableVersion(req, res){
    let transmission = req.body.transmission;
    let model = new RegExp(req.body.modelLine);
    let year = parseInt(moment().format('YYYY'))
    console.log(model)
    console.log(transmission)

    VIN.aggregate([
        { $match:{ article:{ $in:currentVersion} }},
        { $match:{ year:{ $gte:year } }},
        { $match:{ article:model } },

        { $group:{
            _id:{
                article:"$article", 
                transmission:{ 
                    $cond:[ {$eq:[{ $substr:["$article", 2, 2] }, "--"]}, 
                            { $substr:["$article", 10, 1] }, 
                            { $substr:["$article", 3, 1] }
                          ] 
                    } 
                }
        }},

        { $project:{
            _id:0,
            article:"$_id.article",
            transmission:"$_id.transmission",
            information:{ $sum:0 }
        }},
        { $match: { transmission:transmission}}
        ], (error, versions)=> {
        if(error) return res.status(500).send(error)
        if(versions && versions.length>0){
            versions.map( (i)=>{
                i.information = getDataFromVersion(i.article)
            } )
        }

        res.status(200).send(versions)
    })
}

function getDataFromVersion(version){

    let decode = {
        line:'',
        generation:'',
        transmission:'',
        package:'',
        traction:'',
        carBody:'',
        motor:'',
        displacement:'',
        control:'',
        aa:'',
        use:''
    }

    let description = {
        generation:'',
        transmission:'',
        package:'',
        traction:'',
        carBody:'',
        motor:'',
        displacement:'',
        control:'',
        aa:''
    }

    if(version && version.length===15){

        if(version[2] === '-' && version[3]==='-'){
            //NUEVA VERSION DE CODIGOS
            decode.line = version.slice(0, 2);
            decode.generation = version.slice(4, 5);

            decode.package = version.slice(5, 7); //Tipo de equipamiento
            decode.use = version.slice(7, 8);
            decode.traction = version.slice(8, 9);
            decode.carBody = version.slice(9, 10);
            decode.transmission = version.slice(10, 11);
            decode.motor = version.slice(11, 12);
            decode.displacement = version.slice(12, 14);
            decode.aa = version.slice(14, 15);



        } else if(version[6] === '_' && version[7] === '_') {

            decode.line = version.slice(0, 2);
            decode.generation = version.slice(2, 3);
            decode.transmission = version.slice(3, 4);
            decode.package = version.slice(4,6);
            decode.traction = version.slice(8, 9);
            decode.carBody = version.slice(9, 10);
            decode.motor = version.slice(10, 11);
            decode.displacement = version.slice(11, 13);
            decode.control = version.slice(13, 15);

            if(decode.package>10) decode.aa = "A"; else decode.aa = "S";

            

        }

        if(decode.transmission === 'A') description.transmission = 'Automática'; else description.transmission = 'Mecánica';
        switch(decode.motor){ 
            case "G": description.motor = 'Gasolina'; break; 
            case "H": description.motor = 'Híbrido'; break; 
            case 'E': description.motor ='Eléctrico'; break; 
            case 'D': description.motor = 'Diesel'; break; 
            default: description.motor = decode.motor 
        }
        if(decode.aa === "A") description.aa = "Aire Acondicionado"; else description.aa = "Sin Aire";
        switch(decode.carBody){
            case "5": description.carBody = "HatchBack / Camioneta"; break;
            case "4": description.carBody = "Sedán"; break;
            case "2": description.carBody = "Coupé / Cabina Sencilla"; break;
        }
        
        description.displacement = decode.displacement[0]+"."+decode.displacement[1]+" Lts"
        description.generation = decode.generation;
        description.traction = "4x"+decode.traction;
        description.package = "Equipamento "+decode.package;
        description.control = 'Control de version '+decode.control



    }

    let infoCard = { decode:decode, description:description}


    return infoCard
}

function getVinData(req, res, next){
    let vin = req.query.vin;
    if(!vin || vin.length!=17){
        return res.status(200).send({message:'No es un VIN válido', status:404})
    } else {
        VIN.findOne({vin:vin}, (error, result)=>{
            if(error) return res.status(500).send({message:'Ocurrió un error al consultar el VIN', error:error})
            dataVin = result;
            next();
        })
    } 
}

function getVinByPlate(req, res){
    let data = { 
        vin:'',
        linea:'',
        color:'',
        modelo:'', 
        placa:'',
        placaII:'',
        message:'',
        status:0
    };
    let vin = req.query.vin;

    Tickets.aggregate([
                { $match:{ vin:vin }}
        ], (error, result)=>{
        if(error) return res.status(500).send({message:'Ocurrió un error al consultar el VIN', error:error})
            if(dataVin){
                data.vin = dataVin.vin;
                data.linea = dataVin.article.slice(0,2);
                data.color = dataVin.color;
                data.modelo = dataVin.year;
                data.status = 200;
                data.message = 'Vin Disponible';

                if(dataVin != "000XXX" || !dataVin){
                    data.placa = dataVin.id;
                }
            }
            if(result && result.length>0){
                for(let i of result){
                    if(i.plate && i.plate.length==6){
                        data.placaII = i.plate
                    }
                }
                
            }

            res.status(200).send(data)
    })
}

function searchPlate(req, res){
    let plate = req.query.placa;

    VIN.findOne({id:plate}, (error, vin)=>{
        if(error) return res.status(500).send(error)
        if(vin){
            res.status(200).send({status:200, data:vin, vin:vin.vin, msg:'Esta placa está registrada en nuestra bsae de datos'})
        } else {
            res.status(404).send({status:404, data:{}, vin:'', msg:'Esta placa no está registrada en nuestra base de datos'})
        }
        
    })
}

function validationVersion(req, res){
    let vin = req.body.vin;
    let article = req.body.article;
    
    if(!vin || !article){
       return res.status(500).send({status:500, message:`No hay datos que validar`, error:'Error al validar los datos', val:false })
    }
    VIN.findOne({vin:vin}, (error, response)=>{
        if(error) return res.status(500).send({status:500, message:`Ocurrio un error al consultar este VIN: ${vin}`, error:error })
        if(response){
            if(response.article == article ){
                res.status(200).send({status:200, message:`La version es correcta`, val:true})
            } else {
                res.status(200).send({status:201, message:`Este Vin no pertenece a esta versión de equipamento`, val:false})
            }
        } else {
            res.status(200).send({status:201, message:`No se encontró este VIN`, val:false})
        }
    })
}



module.exports = {
    getFilterModels,
    getAvailableVersion,
    getDataFromVersion,
    getVinData,
    getVinByPlate,
    searchPlate,
    validationVersion
}