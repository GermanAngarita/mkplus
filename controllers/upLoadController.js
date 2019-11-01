'use strict'

const Dcsi = require('../models/dcsi')
const Vin = require('../models/vin')
const Tikect = require('../models/ticket')
const Industry = require('../models/industry_report')
const SRG = require('../models/srg')
const PWA = require('../models/pwa')

const SRGPending = require('../models/srg-pending')
const PWAPending = require('../models/pwa-pending')

const ParstDown = require('../models/parts_down')

const AfterReport = require('../models/aftersales_report')
const RPGDetails = require('../models/aftersales_report_details')
const moment = require('moment')

let typesAll = ['CASE','CCLI','RCOM', 'RSEN', 'ACCI', 'RETO', 'INTR', 'GTIA', 'MTO' ]


function dcsiUploads(req, res){
    const dcsi =  new Dcsi({
        lead_id: req.body.lead_id,
        type:req.body.type,
        date: req.body.date,
        cod_country: req.body.cod_country,
        cod_dealer: req.body.cod_dealer,
        id_interviewer: req.body.id_interviewer,
        id_customer: req.body.id_customer,
        vin: req.body.vin,
        cod_category: req.body.cod_category,
        cod_dcsi: req.body.cod_dcsi,
        answer: req.body.answer,
        answerOpen: req.body.answerOpen,
        advisorId: req.body.advisorId
    })
    dcsi.save((err)=>{
        if(err) return res.status(500).send({message:`Error al guardar el DCSI reg ${err}`})
        res.status(200).send({save:1, msg:`Registro Guardado`})
    })
}

function vinsUploads(req, res){
    
    const vin = new Vin({
        enterprise: req.body.enterprise,
        transaction: req.body.transaction,
        department: req.body.department,
        bill: req.body.bill,
        location: req.body.location,
        ubication: req.body.ubication,

        bill_date: moment(req.body.bill_date, 'DD/MM/YYYY'),

        article: req.body.article,
        article_description: req.body.article_description,  //Descripción Articulo

        cod_model:req.body.cod_model,
        model_description: req.body.model_description,
        model: req.body.model,
        model_alt: req.body.model_description,

        origin: req.body.origin,
        vin: req.body.vin,
        engine: req.body.engine,
        id: req.body.id,
        year: req.body.year,
        color: req.body.color,
        sales_point: req.body.sales_point,
        sales_cod: req.body.sales_cod,
        dealer_cod: req.body.dealer_cod,

        use_type: req.body.use_type,
        warranty_type: req.body.warranty_type,
        warranty_duration:  req.body.warranty_duration,

        date_p: moment(req.body.date_p, 'DD/MM/YYYY'),
        date_runt: moment(req.body.date_runt, 'DD/MM/YYYY'),
        date_handover:  moment(req.body.date_handover, 'DD/MM/YYYY'),
        date_retail:  moment(req.body.date_retail, 'DD/MM/YYYY'),
        date_cont:  moment(req.body.date_cont, 'DD/MM/YYYY'), 
        date_init_warranty:  moment(req.body.date_init_warranty, 'DD/MM/YYYY'),
        date_end_warranty:  moment(req.body.date_end_warranty, 'DD/MM/YYYY'),
        
        vsr: req.body.vsr,
        uw: req.body.uw,
    })
    // Validación de las fechas
    if(!vin.date_p) { vin.date_p = ''}
    if(!vin.date_runt) { vin.date_runt='' }
    if(!vin.date_handover) { vin.date_handover = ''}
    if(!vin.date_retail) { vin.date_retail = ''}
    if(!vin.date_cont) { vin.date_cont =''}
    if(!vin.date_init_warranty) { vin.date_init_warranty = ''}
    if(!vin.date_end_warranty) { vin.date_end_warranty = ''}
   
   Vin.findOne({vin:vin.vin}, (err, findVin)=>{
       if(err) return res.status(500).send({msg:`Error al comprobar el VIN ${err}`})
       
       if(findVin){
           //Si el registro está duplicado, devuelve mensaje y continua el proceso
           //Se debe actualizar el VIN si el registro está duplicado
           vin._id = findVin._id

           //Actualización del VIN
           Vin.findByIdAndUpdate(findVin._id, vin, (err, update)=>{
            if(err) return res.status(500).send({msg:`${vin.vin} Error al actualizar el VIN ${err}`, save:1})
            res.status(200).send({save:1, msg:`Registro Actualizado`})
           })
           
       } else {
           //Si el registro no tiene duplicados continua el método de guardado
            vin.save( ( err )=>{
                if(err) return res.status(500).send({msg:`${vin.vin} Error al guardar el VIN ${err}`, save:1})
                res.status(200).send({save:1, msg:`Registro Guardado`})
            })
       }
   })
}

function ticketUploads(req, res){
    const tickect = new Tikect({
        bill_date: new Date(moment(req.body.bill_date, 'DD/MM/YYYY')),
        bill_number:req.body.bill_number,
        vin: req.body.vin,
        plate: req.body.plate,
        kilometers: req.body.kilometers,
        typeIn: req.body.typeIn,
        dealer_cod: req.body.dealer_cod,
        dealer_sales:'',
        use_type:'',
        date_init_warranty:'',
        date_runt:'',
        monthsOnWay:'',
        avgKmtMonth:'',
        create_up: new Date(moment().format())
    })

    if(tickect.typeIn){ 
        tickect.typeIn = tickect.typeIn.toUpperCase()
        let validator = 0;
        for(let i of typesAll){
            validator += parseInt(tickect.typeIn.split(i).length)
        }
        if(validator == 0){
            return res.status(200).send({save:1, msg:`${tickect.dealer_cod} \t ${moment(tickect.bill_date).format('DD-MM-YYYY')} \t ${tickect.vin} \t ${tickect.typeIn} \t Error Tipo Entrada no válido \r\n`})
        }
     } else { 
        return res.status(200).send({msg:`${tickect.dealer_cod} \t ${moment(tickect.bill_date).format('DD-MM-YYYY')} \t ${tickect.vin} \t ${tickect.typeIn} \t Error no tiene concepto de entrada \r\n`, save:1})
     }
    if(tickect.plate && tickect.plate.length>6){
        let plate = tickect.plate.split(/(?:,| |-|#|%|&|=|_|-|°|¬)+/)
        tickect.plate = ''
        for(let i of plate){
            tickect.plate += i.toString()
        }
    } 
    
    if(tickect.dealer_cod){ tickect.dealer_cod = tickect.dealer_cod.toUpperCase() } else { return res.status(200).send({msg:'Dealer Inválido', save:1}) }
    if(!tickect.bill_date){ tickect.bill_date = ''; return res.status(200).send({msg:`${tickect.dealer_cod} \t ${tickect.bill_date} \t ${tickect.vin} \t ${tickect.typeIn} \t Fecha Inválidad \r\n`, save:1}) }
   
    
    Tikect.findOne({vin:tickect.vin, kilometers:tickect.kilometers, typeIn:tickect.typeIn}, (err, find)=>{
        if(err) return res.status(500).send({msg:`Error al comprobar la OT #${moment(tickect.bill_date).format('DD-MM-YYYY')}, error: ${err} \r\n`, save:1})
        if(!find){
            Vin.findOne({vin:req.body.vin }, (err, vin)=>{
                if(err) return res.status(500).send({msg:`${tickect.dealer_cod} \t ${tickect.bill_date} \t ${tickect.vin} \t ${tickect.typeIn} \t Error al consiliar con el VIO ${err} \r\n`, save:1})
                if(vin){
                    tickect.date_init_warranty = vin.date_init_warranty;
                    tickect.date_runt = vin.date_runt;
                    tickect.monthsOnWay = parseInt(moment(new Date(tickect.bill_date)).diff( moment( new Date(vin.date_init_warranty)),'months', false ));
                    if(tickect.monthsOnWay!=0){
                        tickect.avgKmtMonth = parseInt(tickect.kilometers) / parseInt(tickect.monthsOnWay);
                    } else {
                        tickect.avgKmtMonth = null;
                    }
                    tickect.use_type = vin.use_type;
                    tickect.dealer_sales = vin.dealer_cod;
                    tickect.save( (err)=>{
                        if(err) return res.status(200).send({msg:`${tickect.dealer_cod} \t ${moment(tickect.bill_date).format('DD-MM-YYYY')} \t ${tickect.vin} \t ${tickect.typeIn} \t Error al guardar el registro ${err} \r\n`, save:1})
                        res.status(200).send({save:1, msg:`${tickect.dealer_cod} \t ${moment(tickect.bill_date).format('DD-MM-YYYY')} \t ${tickect.vin} \t ${tickect.typeIn} \t Se ha guardado Exitosamente \r\n`})
                    })
                } else {
                    tickect.save( (err)=>{
                        if(err) return res.status(200).send({msg:`${tickect.dealer_cod} \t ${tickect.bill_date} \t ${tickect.vin} \t ${tickect.typeIn} \t Error al guardar el registro ${err} \r\n`, save:1})
                        res.status(200).send({save:1, msg:`${tickect.dealer_cod} \t ${moment(tickect.bill_date).format('DD-MM-YYYY')} \t ${tickect.vin} \t ${tickect.typeIn} \t Se ha guardado Exitosamente \r\n`})
                    })
                }
            })
        } else {
            return res.status(200).send({save:1, msg:`${tickect.dealer_cod} \t ${moment(tickect.bill_date).format('DD-MM-YYYY')} \t ${tickect.vin} \t ${tickect.typeIn} \t Registro Duplicado \r\n`})
        }
    })

    
}

function addMaintenanceToVin(req, res){
    const tickect = new Tikect({
        bill_date: moment(req.body.bill_date, 'DD/MM/YYYY'),
        bill_number:req.body.bill_number,
        vin: req.body.vin,
        plate: req.body.plate,
        kilometers: req.body.kilometers,
        typeIn: req.body.typeIn,
        dealer_cod: req.body.dealer_cod
    })

    if(tickect.typeIn){ tickect.typeIn = tickect.typeIn.toUpperCase() } else { return res.status(200).send({msg:'Tipo de Ingreso Inválido', save:1})}
    if(tickect.dealer_cod){ tickect.dealer_cod = tickect.dealer_cod.toUpperCase() } else { return res.status(200).send({msg:'Dealer Inválido', save:1}) }
    if(!tickect.bill_date){ tickect.bill_date = ''; return res.status(200).send({msg:'Fecha Inválidad', save:1}) }

    Vin.find({vin:tickect.vin}, (err, result)=>{
        if(err) return res.status(500).send({msg:`Error al buscar el VIN`, save:1})
        if(result[0]){
            result[0].maintenance.push({
                bill_date: tickect.bill_date,
                bill_number: tickect.bill_number,
                plate: tickect.plate,
                kilometers: tickect.kilometers,
                typeIn: tickect.typeIn,
                dealer_cod: tickect.dealer_cod
            })

            Vin.findByIdAndUpdate( result[0]._id, result[0], (err, vinUpdate)=>{
                if(err) return res.status(500).send({msg:`Error al actualizar el Registro`, save:1})
                res.status(200).send({save:1, msg:`Registro Guardado`})
            })
        } else {
            res.status(200).send({save:1, msg:`Vin no encontrado`})
        }
        
    })

}

function industryUploads(req, res){
    const industry = new Industry({
        dealer_cod: req.body.dealer_cod,
        date: req.body.date,
        mechanic: req.body.mechanic,
        collision: req.body.collision,
        mechanic_parts: req.body.mechanic_parts,
        collision_parts: req.body.collision_parts,
        showroom_parts: req.body.showroom_parts
    })

    Industry.findOne({dealer_cod:industry.dealer_cod, date:industry.date}, (err, result)=>{
        if(err) return res.status(500).send({msg:'Error al comparar el registro', err:err})
        if(!result){
            industry.save((err)=>{
                if(err) return res.status(500).send({msg:'Error al guardar el registro', err:err})
                res.status(200).send({save:1, msg:'Registro Guardado'})
            })
        } else {
            res.status(200).send({save:1, msg:'Registro Duplicado'})
        }
    })
}

function srgUploads(req, res){
    const srg = new SRG({
        status: req.body.status,
        cl:req.body.cl,
        warranty: req.body.warranty ,
        claim: req.body.claim,
        approval:req.body.approval,
        vin:req.body.vin,
        order:req.body.order,
        kilometers:req.body.kilometers,
        repair_date: moment(req.body.repair_date, 'DD/MM/YYYY'),
        catalog:req.body.catalog,
        part_code:req.body.part_code, 
        part_name:req.body.part_name,
        acl:req.body.acl,
        cause_code:req.body.cause_code,
        description_issue: req.body.description_issue,
        nature_code:req.body.nature_code,
        nature_description:req.body.nature_description,
        painting_code:req.body.painting_code,
        painting_description: req.body.painting_description,
        others_t1: req.body.others_t1,
        others_t1_description: req.body.others_t1_description,
        others_t2:req.body.others_t2,    
        others_t2_description:req.body.others_t2_description ,
        others_values:req.body.others_values,
        date_init_warranty: moment(req.body.date_init_warranty, 'DD/MM/YYYY'),

        date_import: moment(req.body.date_import, 'DD/MM/YYYY'),
        date_first_send: moment(req.body.date_first_send, 'DD/MM/YYYY'),
        date_last_send: moment(req.body.date_last_send, 'DD/MM/YYYY'),

        date_srg_back: moment(req.body.date_srg_back, 'DD/MM/YYYY'),
        date_decision: moment(req.body.date_decision, 'DD/MM/YYYY'),

        date_approval: moment(req.body.date_approval, 'DD/MM/YYYY'),
        enterprise:req.body.enterprise,
        
        date_set: moment(req.body.date_set, 'DD/MM/YYYY'),
        
        hour_set:req.body.hour_set,
        pro_set:req.body.pro_set,
        user_set:req.body.user_set,
        
        date_create: moment(req.body.date_create, 'DD/MM/YYYY'),
        
        hour_create:req.body.hour_create,
        pro_create:req.body.pro_create,
        user_create:req.body.user_create,
    })
    
    if(!srg.date_init_warranty){ srg.date_init_warranty = '' }
    if(!srg.repair_date){ srg.repair_date = '' }
    if(!srg.date_import){ srg.date_import = '' }
    if(!srg.date_first_send){ srg.date_first_send = '' }
    if(!srg.date_last_send){ srg.date_last_send = ''  }
    if(!srg.date_srg_back){ srg.date_srg_back = '' }
    if(!srg.date_decision){  srg.date_decision = '' }
    if(!srg.date_approval){ srg.date_approval = '' }
    if(!srg.date_set){ srg.date_set ='' }
    if(!srg.date_create){ srg.date_create =''}


    SRG.findOne({
        vin:srg.vin,
        cl:srg.cl,
        warranty:srg.warranty
    }, (err, result)=>{
        if(err) return res.status(500).send({save:1, msg:`${srg.vin} Error al buscar el SRG reg ${err}`})
        if(result){
            srg._id = result._id
            SRG.findByIdAndUpdate(srg._id, srg, (err, success)=>{
                if(err) return res.status(500).send({save:1, msg:`${srg.vin}, ocurrió un error al actualizar el SRG ${err}`})
                res.status(200).send({msg:'Registro actualizado', save:1})
            })

        } else {
            srg.save( (err)=>{
                if(err) return res.status(500).send({save:1, msg:` ${srg.vin} Error al guardar el SRG reg ${err}`})
                res.status(200).send({save:1, msg:`Registro Guardado`})
            })
        }
    })
    
}

function pwaUploads(req, res){

    let key = req.body.cl + parseInt(req.body.pwa.substring(5, req.body.pwa.length))*1 + req.body.vin

    const pwa = new PWA({
        pwa: req.body.pwa, 
        claim: req.body.claim, 
        cl: req.body.cl, 
        approval: req.body.approval, 
        month_approval: req.body.month_approval, 
        pwa_cl: req.body.pwa_cl, 
        pwa_pro: req.body.pwa_pro, 
        vin: req.body.vin, 
        model_code: req.body.model_code, 
        brand: req.body.brand, 
        date_inspection: moment(req.body.date_inspection, 'DD/MM/YYYY'), 
        order: req.body.order, 
        kilometers: req.body.kilometers, 
        column: req.body.column, 
        cause_code: req.body.cause_code, 
        cause_name: req.body.cause_name, 
        parts: req.body.parts, 
        mo: req.body.mo, 
        others: req.body.others, 
        parts_delivered: req.body.parts_delivered, 
        pwa_cost: req.body.pwa_cost, 
        refund_dealer: req.body.refund_dealer, 
        customer_opinion: req.body.customer_opinion, 
        cause: req.body.cause, 
        recommend_repairs: req.body.recommend_repairs, 
        responsable: req.body.responsable, 
        others_description: req.body.others_description, 
        work_other_t1: req.body.work_other_t1, 
        work_other_t1_description: req.body.work_other_t1_description, 
        issue_code: req.body.issue_code, 
        issue_description: req.body.issue_description, 
        nature_code: req.body.nature_code, 
        nature_description: req.body.nature_description, 
        pwa_code_1: req.body.pwa_code_1, 
        pwa_code_1_description: req.body.pwa_code_1_description, 
        pwa_code_2: req.body.pwa_code_2, 
        pwa_code_2_description: req.body.pwa_code_2_description, 
        parts_value_pro: req.body.parts_value_pro, 
        mo_value_pro: req.body.mo_value_pro, 
        others_value_pro: req.body.others_value_pro, 
        date_approval: moment(req.body.date_approval, 'DD/MM/YYYY'), 
        date_init_warranty: moment(req.body.date_init_warranty, 'DD/MM/YYYY'), 
        date_shipment: moment(req.body.date_shipment, 'DD/MM/YYYY'), 
        date_retail: moment(req.body.date_retail, 'DD/MM/YYYY'), 
        vehicle_owner: req.body.vehicle_owner, 
        vehicle_color: req.body.vehicle_color, 
        error_pwa: req.body.error_pwa, 
        observations: req.body.observations, 
        status: req.body.status, 
        date_first_send: moment(req.body.date_first_send, 'DD/MM/YYYY'), 
        date_last_send: moment(req.body.date_last_send, 'DD/MM/YYYY'), 
        date_back: moment(req.body.date_back, 'DD/MM/YYYY'), 
        date_set: moment(req.body.date_set, 'DD/MM/YYYY'), 
        hour_set: req.body.hour_set, 
        user_set: req.body.user_set, 
        pro_set: req.body.pro_set, 
        date_set_2: moment(req.body.date_set_2, 'DD/MM/YYYY'), 
        hour_set_2: req.body.hour_set_2, 
        user_set_2: req.body.user_set_2, 
        pro_set_2: req.body.pro_set_2, 
        key:key.toString()
    })
    

    if(!pwa.date_inspection){ pwa.date_inspection = '' } 
    if(!pwa.date_approval){ pwa.date_approval = '' } 
    if(!pwa.date_init_warranty){ pwa.date_init_warranty = '' } 
    if(!pwa.date_shipment){ pwa.date_shipment = '' } 
    if(!pwa.date_retail){ pwa.date_retail = '' } 
    if(!pwa.date_first_send){ pwa.date_first_send = '' } 
    if(!pwa.date_last_send){ pwa.date_last_send = '' } 
    if(!pwa.date_back){ pwa.date_back = '' } 
    if(!pwa.date_set){ pwa.date_set = '' } 
    if(!pwa.date_set_2){ pwa.date_set_2 = '' } 

    PWA.findOne({
        pwa:req.body.pwa,
        cl:req.body.cl,
        vin:req.body.vin
    }, (err, doc)=>{
        if(err) return res.status(500).send({save:1, msg:`Error al consultar el PWA ${err}`})
        if(doc){
            pwa._id = doc._id;
            PWA.findByIdAndUpdate(doc._id, pwa, (err)=>{
                if(err) return res.status(500).send({save:1, msg:`Error al actualizar PWA`, err:err})
                res.status(200).send({save:1, msg:'PWA Actualizado'})
            })
        } else {
            pwa.save( (err)=>{
                if(err) return res.status(500).send({save:1, msg:`Error al guardar el PWA ${err}`})
                res.status(200).send({save:1, msg:'PWA Guardado'})
            })
        }
    })
}

function aftersalesUploads(req, res){
    const rpg = new AfterReport({
        cl: req.body.cl, 
        warranty: req.body.warranty, 
        type: req.body.type, 
        name: req.body.name, 
        name_dealer: req.body.name_dealer, 
        nit_dealer: req.body.nit_dealer, 
        vin: req.body.vin, 
        model: req.body.model, 
        model_description: req.body.model_description, 
        color: req.body.color, 
        date_warranty: moment(req.body.date_warranty, 'DD/MM/YYYY'), 
        kilometers: req.body.kilometers, 
        or: req.body.or, 
        date_repair: moment(req.body.date_repair, 'DD/MM/YYYY'), 
        code_part: req.body.code_part, 
        name_part: req.body.name_part, 
        nature_code: req.body.nature_code, 
        nature_name: req.body.nature_name, 
        issue_code: req.body.issue_code, 
        issue_description: req.body.issue_description, 
        type_1: req.body.type_1, 
        works_others_type_1: req.body.works_others_type_1, 
        type_2: req.body.type_2, 
        works_others_type_2: req.body.works_others_type_2, 
        parts_value: req.body.parts_value, 
        mo_value: req.body.mo_value, 
        others_value: req.body.others_value, 
        total_value: req.body.total_value, 
        trouble_description: req.body.trouble_description, 
        causes: req.body.causes, 
        solution: req.body.solution, 
        approval_reponsable: req.body.approval_reponsable, 
        date_approval: moment(req.body.date_approval, 'DD/MM/YYYY'), 
        year_month_approval: req.body.year_month_approval, 
        bill_number: req.body.bill_number, 
        claim_number: req.body.claim_number, 
        warranty_responsable: req.body.warranty_responsable, 
        parts_value_dollars: req.body.parts_value_dollars, 
        mo_value_dollars: req.body.mo_value_dollars, 
        others_value_dollars: req.body.others_value_dollars, 
        total_value_dollars: req.body.total_value_dollars, 
        parts_recovered_dollars: req.body.parts_recovered_dollars, 
        mo_recovered_dollars: req.body.mo_recovered_dollars, 
        others_recovered_dollars: req.body.others_recovered_dollars, 
        total_recovered_dollars: req.body.total_recovered_dollars, 
        hour_value_dealer: req.body.hour_value_dealer, 
        pwa_number: req.body.pwa_number, 
        pwa_code_1: req.body.pwa_code_1, 
        pwa_name_code_1: req.body.pwa_name_code_1, 
        pwa_code_2: req.body.pwa_code_2, 
        pwa_name_code_2: req.body.pwa_name_code_2, 
        acl: req.body.acl, 
        local_facilities: req.body.local_facilities, 
        tracing: req.body.tracing
    })

    if(!rpg.date_warranty){ rpg.date_warranty ='' }
    if(!rpg.date_repair){ rpg.date_repair ='' }
    if(!rpg.date_approval){ rpg.date_approval ='' }


    AfterReport.findOne({
        cl: req.body.cl,
        warranty: req.body.warranty,
        vin: req.body.vin
    }, (err, doc)=>{
        if(err) return res.status(500).send({save:1, msg:`Error al consultar el RPG ${err}`})
        if(doc){
            rpg._id = doc._id;
            AfterReport.findByIdAndUpdate(doc._id, rpg, (err)=>{
                if(err) return res.status(500).send({save:1, msg:`Error al actualizar el RPG:Reporte Posventa Garantías ${err}`})
                res.status(200).send({save:1, msg:'RPG Actualizado'})
            })
        } else {
            rpg.save( (err)=>{
                if(err) return res.status(500).send({save:1, msg:`Error al guardar el RPG:Reporte Posventa Garantías ${err}`})
                res.status(200).send({save:1, msg:'RPG Guardado'})
            })
        }
    })

    

}

function aftersalesUploadsDetails(req, res){

    let cl = req.body.srg.split('-')[0];
    let warranty = parseInt(req.body.srg.split('-')[1]) * 1;
    const rpg = new RPGDetails({
        srg: req.body.srg, 
        type: req.body.type, 
        name: req.body.name, 
        date_repair: moment(req.body.date_repair, 'DD/MM/YYYY'), 
        vin: req.body.vin, 
        model: req.body.model, 
        model_description: req.body.model_description, 
        type_reg: req.body.type_reg, 
        code_reg: req.body.code_reg, 
        name_reg: req.body.name_reg, 
        amount: req.body.amount, 
        cost_part_clr: req.body.cost_part_clr, 
        cost_part_dealer: req.body.cost_part_dealer, 
        cost_part_warranty: req.body.cost_part_warranty, 
        parts_dollars: req.body.parts_dollars, 
        value_unit: req.body.value_unit, 
        mo_value: req.body.mo_value, 
        mo_value_requested: req.body.mo_value_requested, 
        reponsable_warranty: req.body.reponsable_warranty,
        year_month_approval:''
    })
    if(!rpg.date_repair){ rpg.date_repair ='' }

    AfterReport.findOne({
        cl: cl,
        warranty: warranty,
        vin: req.body.vin
    }, (err, result)=>{
        if(err) console.log(err)
        if(result){
            rpg.year_month_approval = result.year_month_approval;

            // Inicia el guardado de los RPGDetails
            RPGDetails.findOne({
                srg: req.body.srg,
                code_reg: req.body.code_reg,
                vin: req.body.vin
            }, (err, doc)=>{
                if(err) return res.status(500).send({save:1, msg:`Error al consultar el RPGDetails ${err}`})
                if(doc){
                    rpg._id = doc._id;
                    RPGDetails.findByIdAndUpdate(doc._id, rpg, (err)=>{
                        if(err) return res.status(500).send({save:1, msg:`Error al actualizar el RPG Details ${err}`})
                        res.status(200).send({save:1, msg:'RPG Details Actualizado'})
                    })

                } else {
                    rpg.save( (err)=>{
                        if(err) return res.status(500).send({save:1, msg:`Error al guardar el RPG:Reporte Posventa Garantías ${err}`})
                        res.status(200).send({save:1, msg:'RPG Guardado'})
                    })
                }
            })

            
            // Fin del guardado o update
        } else {
            res.status(200).send({save:1, msg:'RPG No se encontró'})
        }
        
    })

    
}

//Removing pending
function removeSRGPending(req, res){
    SRGPending.remove({}, (err)=>{
        if(err) return res.status(200).send(err)
        res.status(200).send({msg:'Se ha borrado correctamente los SRG Pendientes', delet:1})
    })
}
function removePWAPending(req, res){
    PWAPending.remove({}, (err)=>{
        if(err) return res.status(200).send(err)
        res.status(200).send({msg:'Se ha borrado correctamente los PWA Pendientes', delet:1})
    })
}

function srgPendingUploads(req, res){
    const srg = new SRGPending({
        status: req.body.status,
        cl:req.body.cl,
        warranty: req.body.warranty ,
        claim: req.body.claim,
        approval:req.body.approval,
        vin:req.body.vin,
        order:req.body.order,
        kilometers:req.body.kilometers,
        repair_date: moment(req.body.repair_date, 'DD/MM/YYYY'),
        catalog:req.body.catalog,
        part_code:req.body.part_code, 
        part_name:req.body.part_name,
        acl:req.body.acl,
        cause_code:req.body.cause_code,
        description_issue: req.body.description_issue,
        nature_code:req.body.nature_code,
        nature_description:req.body.nature_description,
        painting_code:req.body.painting_code,
        painting_description: req.body.painting_description,
        others_t1: req.body.others_t1,
        others_t1_description: req.body.others_t1_description,
        others_t2:req.body.others_t2,    
        others_t2_description:req.body.others_t2_description ,
        others_values:req.body.others_values,
        date_init_warranty: moment(req.body.date_init_warranty, 'DD/MM/YYYY'),

        date_import: moment(req.body.date_import, 'DD/MM/YYYY'),
        date_first_send: moment(req.body.date_first_send, 'DD/MM/YYYY'),
        date_last_send: moment(req.body.date_last_send, 'DD/MM/YYYY'),

        date_srg_back: moment(req.body.date_srg_back, 'DD/MM/YYYY'),
        date_decision: moment(req.body.date_decision, 'DD/MM/YYYY'),

        date_approval: moment(req.body.date_approval, 'DD/MM/YYYY'),
        enterprise:req.body.enterprise,
        
        date_set: moment(req.body.date_set, 'DD/MM/YYYY'),
        
        hour_set:req.body.hour_set,
        pro_set:req.body.pro_set,
        user_set:req.body.user_set,
        
        date_create: moment(req.body.date_create, 'DD/MM/YYYY'),
        
        hour_create:req.body.hour_create,
        pro_create:req.body.pro_create,
        user_create:req.body.user_create,
    })
    
    if(!srg.date_init_warranty){ srg.date_init_warranty = '' }
    if(!srg.repair_date){ srg.repair_date = '' }
    if(!srg.date_import){ srg.date_import = '' }
    if(!srg.date_first_send){ srg.date_first_send = '' }
    if(!srg.date_last_send){ srg.date_last_send = ''  }
    if(!srg.date_srg_back){ srg.date_srg_back = '' }
    if(!srg.date_decision){  srg.date_decision = '' }
    if(!srg.date_approval){ srg.date_approval = '' }
    if(!srg.date_set){ srg.date_set ='' }
    if(!srg.date_create){ srg.date_create =''}

    srg.save( (err)=>{
        if(err) return res.status(500).send({save:1, msg:` ${srg.vin} Error al guardar el SRG reg ${err}`})
        res.status(200).send({save:1, msg:`Registro Guardado`})
    })
}

function pwaPendingUploads(req, res){
    // let key = req.body.cl + parseInt(req.body.pwa.substring(5, req.body.pwa.length))*1 + req.body.vin

    const pwa = new PWAPending({
        pwa: req.body.pwa, 
        claim: req.body.claim, 
        cl: req.body.cl, 
        approval: req.body.approval, 
        month_approval: req.body.month_approval, 
        pwa_cl: req.body.pwa_cl, 
        pwa_pro: req.body.pwa_pro, 
        vin: req.body.vin, 
        model_code: req.body.model_code, 
        brand: req.body.brand, 
        date_inspection: moment(req.body.date_inspection, 'DD/MM/YYYY'), 
        order: req.body.order, 
        kilometers: req.body.kilometers, 
        column: req.body.column, 
        cause_code: req.body.cause_code, 
        cause_name: req.body.cause_name, 
        parts: req.body.parts, 
        mo: req.body.mo, 
        others: req.body.others, 
        parts_delivered: req.body.parts_delivered, 
        pwa_cost: req.body.pwa_cost, 
        refund_dealer: req.body.refund_dealer, 
        customer_opinion: req.body.customer_opinion, 
        cause: req.body.cause, 
        recommend_repairs: req.body.recommend_repairs, 
        responsable: req.body.responsable, 
        others_description: req.body.others_description, 
        work_other_t1: req.body.work_other_t1, 
        work_other_t1_description: req.body.work_other_t1_description, 
        issue_code: req.body.issue_code, 
        issue_description: req.body.issue_description, 
        nature_code: req.body.nature_code, 
        nature_description: req.body.nature_description, 
        pwa_code_1: req.body.pwa_code_1, 
        pwa_code_1_description: req.body.pwa_code_1_description, 
        pwa_code_2: req.body.pwa_code_2, 
        pwa_code_2_description: req.body.pwa_code_2_description, 
        parts_value_pro: req.body.parts_value_pro, 
        mo_value_pro: req.body.mo_value_pro, 
        others_value_pro: req.body.others_value_pro, 
        date_approval: moment(req.body.date_approval, 'DD/MM/YYYY'), 
        date_init_warranty: moment(req.body.date_init_warranty, 'DD/MM/YYYY'), 
        date_shipment: moment(req.body.date_shipment, 'DD/MM/YYYY'), 
        date_retail: moment(req.body.date_retail, 'DD/MM/YYYY'), 
        vehicle_owner: req.body.vehicle_owner, 
        vehicle_color: req.body.vehicle_color, 
        error_pwa: req.body.error_pwa, 
        observations: req.body.observations, 
        status: req.body.status, 
        date_first_send: moment(req.body.date_first_send, 'DD/MM/YYYY'), 
        date_last_send: moment(req.body.date_last_send, 'DD/MM/YYYY'), 
        date_back: moment(req.body.date_back, 'DD/MM/YYYY'), 
        date_set: moment(req.body.date_set, 'DD/MM/YYYY'), 
        hour_set: req.body.hour_set, 
        user_set: req.body.user_set, 
        pro_set: req.body.pro_set, 
        date_set_2: moment(req.body.date_set_2, 'DD/MM/YYYY'), 
        hour_set_2: req.body.hour_set_2, 
        user_set_2: req.body.user_set_2, 
        pro_set_2: req.body.pro_set_2, 
        // key:key.toString()
    })
    

    if(!pwa.date_inspection){ pwa.date_inspection = '' } 
    if(!pwa.date_approval){ pwa.date_approval = '' } 
    if(!pwa.date_init_warranty){ pwa.date_init_warranty = '' } 
    if(!pwa.date_shipment){ pwa.date_shipment = '' } 
    if(!pwa.date_retail){ pwa.date_retail = '' } 
    if(!pwa.date_first_send){ pwa.date_first_send = '' } 
    if(!pwa.date_last_send){ pwa.date_last_send = '' } 
    if(!pwa.date_back){ pwa.date_back = '' } 
    if(!pwa.date_set){ pwa.date_set = '' } 
    if(!pwa.date_set_2){ pwa.date_set_2 = '' } 

    pwa.save( (err)=>{
        if(err) return res.status(500).send({save:1, msg:`Error al guardar el PWA ${err}`})
        res.status(200).send({save:1, msg:'PWA Guardado'})
    })
}

function partsDownUploads(req, res){
    const partsDown = new ParstDown({
        it : req.body.it, 
        cod_dealer : req.body.cod_dealer, 
        dealer_name : req.body.dealer_name, 
        date : moment(req.body.date), 
        city : req.body.city, 
        month : req.body.month, 
        total_amount : req.body.total_amount, 
        claim : req.body.claim, 
        or : req.body.or, 
        parts_ref : req.body.parts_ref, 
        parts_des : req.body.parts_des, 
        amount : req.body.amount, 
        date_repair : moment(req.body.date_repair, 'DD/MM/YYYY'), 
        vin : req.body.vin, 
        date_approval : req.body.date_approval, 
        witnesses: req.body.witnesses,
        key: req.body.cod_dealer + req.body.claim + req.body.parts_ref + req.body.vin,
        attach: req.body.attach,
        totalAmount: req.body.totalAmount
    })

    if(!partsDown.date){ partsDown.date = ''}
    if(!partsDown.date_repair){ partsDown.date_repair = ''}
    if(!partsDown.date_approval){ partsDown.date_approval = ''}

    partsDown.save( (err)=>{
        if(err) return res.status(500).send({save:1, msg:`Error al guardar el registro ${err}`})
        res.status(200).send({save:1, msg:'Registro guardado'})
    })
}



// function test(){
//     const pwa = {
//         pwa:'CL103000948',
//         cl:'CL103'
//     }

//     let key = pwa.cl + parseInt(pwa.pwa.substring(5, pwa.pwa.length))*1 + pwa.vin

//     console.log(key)

// }
// test()

module.exports = { 
    dcsiUploads,
    vinsUploads,
    ticketUploads,
    addMaintenanceToVin,
    industryUploads,
    srgUploads,
    pwaUploads,
    aftersalesUploads,
    aftersalesUploadsDetails,

    removeSRGPending,
    srgPendingUploads,

    removePWAPending,
    pwaPendingUploads,

    partsDownUploads
}