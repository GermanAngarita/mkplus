'use strict'

const Team = require('../models/team')
const multer = require('multer')
const fs = require('fs')
const moment = require('moment')


function createMemberTeam(req, res){
    const newTeam = new Team({
        name: req.body.name,
        reportReception:req.body.reportReception,
        surveyAlert: req.body.surveyAlert,
        code_dealer: req.body.dealer,
        last_name: req.body.last_name,
        position:req.body.position,
        nid: req.body.nid,
        email: req.body.email,
        mobile: req.body.mobile,
        telephone: req.body.telephone,
        dateIn: req.body.dateIn,
        ddms_user: req.body.ddms_user,
        profile_picture: {
            url:req.body.profile_picture.url,
            name: req.body.profile_picture.name,
            type:req.body.profile_picture.type
        }
    });
    newTeam.save( (err, success)=>{
        if(err) return res.status(500).send({msg:'Ocurrio un error al crear el miembro del equipo', err:err})
        res.status(200).send({msg:'El miembro del equipo se ha creado con exito '})
    })
}

function editMemberTeam(req, res){
    let id = req.body._id;
    let body = req.body;

    let working_days = 0;
    if(req.body.dateOut && (req.body.dateIn < req.body.dateOut)){
        working_days = moment(req.body.dateOut).diff(req.body.dateIn, 'days')
    }
    let member = {
        _id:req.body._id,
        name: req.body.name,
        reportReception:req.body.reportReception,
        surveyAlert: req.body.surveyAlert,
        code_dealer: req.body.code_dealer,
        last_name: req.body.last_name,
        position:req.body.position,
        nid: req.body.nid,
        email: req.body.email,
        mobile: req.body.mobile,
        telephone: req.body.telephone,
        dateIn: req.body.dateIn,
        dateOut: req.body.dateOut,
        ddms_user: req.body.ddms_user,
        upDate: new Date( Date.now() ),
        status: req.body.status,
        working_days: working_days,
        profile_picture: {
            url:req.body.profile_picture.url,
            name: req.body.profile_picture.name,
            type:req.body.profile_picture.type
        }
    }
    Team.findByIdAndUpdate(id, member, (err, success)=>{
        if(err) return res.status(500).send({msg:'Ocurrio un error al actualizar el miembro del equipo', err:err})
        res.status(200).send({msg:'El miembro del equipo se ha actualizado con exito '})
    })
}

function deletMemberTeam(req, res){
    let id = req.body._id;
    Team.findByIdAndRemove( id, (err, success)=>{
        if(err) return res.status(500).send({msg:'Ocurrio un error al eliminar el miembro del equipo', err:err})
        res.status(200).send({msg:'El miembro del equipo se ha eliminado con exito '})
    })
}

function getMemberTeam(req, res){
    let dealer = req.body.code_dealer;

    Team.find({code_dealer:{$in:dealer}}, (err, dealers)=>{
        if(err) return res.status(500).send({msg:'Ocurrio un error al obtener los miembros del equipo', err:err})
        res.status(200).send(dealers)
    })
}

function getMembersByFilter(req, res){
    let name = new RegExp(req.body.name)
    let last_name = new RegExp(req.body.last_name)
    let nid = new RegExp(req.body.nid)
    let ddms_user = new RegExp(req.body.ddms_user)
    let code_dealer = req.body.code_dealer
    let position = req.body.position
    let status = req.body.status
    let skip = req.body.skip
    let limit = parseInt(req.body.limit)

    Team.find({
        name:name,
        last_name:last_name,
        nid:nid,
        ddms_user:ddms_user,
        code_dealer:code_dealer,
        position:position,
        status:status
    }, (err, members)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los miembros del equipo', err:err})
        res.status(200).send(members)
    }).skip( skip ).limit(limit)
}

function getCountMembersByfilter(req, res){
    let name = new RegExp(req.body.name)
    let last_name = new RegExp(req.body.last_name)
    let nid = new RegExp(req.body.nid)
    let ddms_user = new RegExp(req.body.ddms_user)
    let code_dealer = req.body.code_dealer
    let position = []
    for(let i of req.body.position){
        position.push( new RegExp(i))
    }
    // let position = req.body.position
    let status = req.body.status
    let skip = req.body.skip
    let limit = parseInt(req.body.limit)
    Team.count({
        name:name,
        last_name:last_name,
        nid:nid,
        ddms_user:ddms_user,
        code_dealer:code_dealer,
        position:position,
        status:status
    }, (err, members)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los miembros del equipo', err:err})
        res.status(200).send({count:members})
    })
}

function createDirDealer(dealer){
    let dirname = './uploads/profiles/'+dealer+'/';
    fs.mkdir(dirname, (err)=>{
        if(err && err.code == "EEXIST"){
        } else if(err){
            return res.status(500).send({msg:'Error al crear el directorio'})
        } 
       
    })
}

function uploadImgProfile(req, res){
    let name = '';
    let originalname = '';
    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            createDirDealer(req.body.dealer)
            cb(null, './uploads/profiles/'+req.body.dealer+'/');
        },
        filename: (req, file, cb)=>{
          const datetimetamp = Date.now();
          name = req.body.dealer+'-'+req.body.id+'-'+datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1];
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

function deletFile(req, res){
    let path = req.body.url.split(req.body.server)
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

module.exports = {
    createMemberTeam,
    editMemberTeam,
    deletMemberTeam,
    getMemberTeam,
    getMembersByFilter,
    getCountMembersByfilter,
    uploadImgProfile,
    deletFile
}

