 
/*
/* LINEA DE INSTRUCCIONES PARA ACTUALIZACION MANUAL DE LA BASE DE DATOS [BDD MONGODB]
/* Actualización Septiembre de 2018
/*
*/

/** 
**  Paso 1.: Actualizar el cambio de código de las preguntas SQ050 Y SQ100
**  
**  Utlizar la linea de comandos o el Shell de la Base de datos, o puede utilizar Robo 3T 1.2
**  Despues de conectarse a la base de datos:
**      1. Abra el folder Collections
**      2. Doble clic sobre la colección llamada "dcsi"
**      3. En el campo para esribir las consultas copie las siguiente linea de instrucciones
**/
        db.getCollection('dcsis').find({cod_dcsi:'SQ050'}).forEach( function(docs){
            db.getCollection('dcsis').update({_id:docs._id}, {$set:{"cod_dcsi":"SQ160"}})
        })
/*
**      4. Espere los que realice los cambios
**      5. Copie la segunda linea de instrucciones
**      6. Espere los resultados y compruebe que los cambios se hallan efectuado
**/

        db.getCollection('dcsis').find({cod_dcsi:'SQ100'}).forEach( function(docs){
            db.getCollection('dcsis').update({_id:docs._id}, {$set:{"cod_dcsi":"SQ170"}})
        })

/** 
 *  Paso 2.: Actualizar el rango de valores de 1 ~ 5 al nuevo rango 1 ~ 10
 *  
 *  Códigos de pregunta que deben ser actualizados:
 *  ['BQ010', 'SQ020', 'SQ040', 'SQ060', 'SQ160', 'SQ110', 'SQ090', 'CQ020']
 *  1. Copie la siguiente línea de comandos
 *  2. Ejecutelo y espere los resultados
 *  3. Si el sistema le notifica errores abstengase de ejecutar el comando en mas de una ocasión, por favor
 *  revise los resultados haciendo una consulta normal para verificar si los cambios fueron o no aplicados
 * 
*/
        // No copie la definición de toUpdate
        let toUpdate = ['BQ010', 'SQ020', 'SQ040', 'SQ060', 'SQ160', 'SQ110', 'SQ090', 'CQ020', 'SQ030']
        // No copie la definición de toUpdate

        db.getCollection('dcsis').find({cod_dcsi:{ $in: ['BQ010', 'SQ020'] }}).forEach( function(docs){
            let value = docs.answer * 2
            db.getCollection('dcsis').update({_id:docs._id}, {$set:{"answer":value}})
        })

/** 
 *  Continue con la siguiente linea de instrucciones.
*/

        db.getCollection('dcsis').find({cod_dcsi:{ $in: ['SQ040', 'SQ060'] }}).forEach( function(docs){
            let value = docs.answer * 2
            db.getCollection('dcsis').update({_id:docs._id}, {$set:{"answer":value}})
        })


/** 
 *  Continue con la siguiente linea de instrucciones.
*/

        db.getCollection('dcsis').find({cod_dcsi:{ $in: ['SQ160', 'SQ110'] }}).forEach( function(docs){
            let value = docs.answer * 2
            db.getCollection('dcsis').update({_id:docs._id}, {$set:{"answer":value}})
        })

/** 
 *  Continue con la siguiente linea de instrucciones.
*/

        db.getCollection('dcsis').find({cod_dcsi:{ $in: ['SQ090', 'CQ020'] }}).forEach( function(docs){
            let value = docs.answer * 2
            db.getCollection('dcsis').update({_id:docs._id}, {$set:{"answer":value}})
        })

/** 
 *  Continue con la siguiente linea de instrucciones.
*/

db.getCollection('dcsis').find({cod_dcsi:{ $in: ['SQ080', 'SQ070', 'SQ030', 'SQ170'] }}).forEach( function(docs){
    let value = docs.answer * 2
    db.getCollection('dcsis').update({_id:docs._id}, {$set:{"answer":value}})
})

/** 
 *  Continue con la siguiente linea de instrucciones.
*/

/**
 *  En caso de que sólo necesite editar un periodo en particular puede hacer con la siguiente linea de comandos
 * 
 *  1. Reemplace COD_DCSI por el codigo de pregunta que se desea cambiar
 *  2. Luego en el campo date.$gte: Coloque la fecha inicial del rango que quiere editar
 *  3. El formato de la fecha debe ser YYYYMMDD, haga lo mismo con el campo date.$lte
 *  4. Ejecute la consulta
 */

db.getCollection('dcsis').find({
    cod_dcsi:{ $in: ['COD_DCSI'] },
    date:{ $gte:20180401, $lte:20180431 }
}).forEach( function(docs){
    let value = docs.answer * 2
    db.getCollection('dcsis').update({_id:docs._id}, {$set:{"answer":value}})
})

/**
 * 
 * 
 * Actualización Manual TMOG
 * 
 * 
 * 
 */

db.getCollection('evaluationtmogs').find({}).forEach( function(docs){
    db.getCollection('evaluationtmogs').update({_id:docs._id}, {$set:{"status":true}})
})

/**
 * 
 * 
 * Actualización Members Team
 * 
 * 
 * 
 */

db.getCollection('teams').find({}).forEach( function(docs){
    db.getCollection('teams').update({_id:docs._id}, {$set:{"status":true}})
})
// Cambio de variables string a mayusculas
db.getCollection('teams').find({}).forEach( function(docs){
    db.getCollection('teams').update({_id:docs._id}, {$set:{"name":docs.name.toUpperCase(),"status":true, "last_name":docs.last_name.toUpperCase()}})
})

//Actualización del Tipo de uso a través del tipo de garantía asignada
db.getCollection('vins').find({}).forEach( function(docs){
    if(docs.warranty_duration >730){
        db.getCollection('vins').update({_id:docs._id}, {$set:{"use_type":"PARTICULAR"}})
    } else {
        db.getCollection('vins').update({_id:docs._id}, {$set:{"use_type":"PUBLICO"}})
    }
} )

//Segunda Fase
db.getCollection('vins').find({use_type:"PUBLICO/PARTICULAR"}).forEach( function(docs){
    let pub = "PUBLICO"
    let part = "PARTICULAR"
    if(docs.warranty_duration > 730){
        db.getCollection('vins').update({_id:docs._id}, {$set:{"use_type":part}})
    } else {
        db.getCollection('vins').update({_id:docs._id}, {$set:{"use_type":pub}})
    }
} )

db.getCollection('tickets').find({use_type:"PUBLICO/PARTICULAR"}).forEach( function(docs){
    db.getCollection('tickets').update({_id:docs._id}, {$set:{"use_type":"PUBLICO"}})
} )

// Correccion del tipo de uso de las entradas a mantenimiento
db.getCollection('tickets').find({use_type:"PUBLICO/PARTICULAR"}).forEach( function(docs){
    db.getCollection('vins').find({vin:docs.vin}).forEach( function(vines){
            db.getCollection('tickets').update({_id:docs._id}, {$set:{"use_type":vines.use_type}})
                print(docs.vin, vines.vin)
                print(docs.use_type, vines.use_type)
        })
})

db.getCollection('tickets').find({dealer_cod:"CL006"}).forEach( function(docs){
    db.getCollection('vins').find({vin:docs.vin}).forEach( function(vines){
        let pub = "PUBLICO"
        let part = "PARTICULAR"

        if(vines.warranty_duration > 730){
            db.getCollection('tickets').update({_id:docs._id}, {$set:{"use_type":part}})
        } else {
            db.getCollection('tickets').update({_id:docs._id}, {$set:{"use_type":pub}})
        }
        })
})

db.getCollection('dcsis').find({date:{ $gte:20190401}}).forEach( function(docs){
    db.getCollection('dcsis').update({_id:docs._id}, { $set:{ "date":20190331 }})
})



// Grupo de CL para busquedas en ROBO 3T
dealers=[
    "CL000",
    "CL001",
    "CL002",
    "CL003",
    "CL006",
    "CL007",
    "CL008",
    "CL018",
    "CL024",
    "CL028",
    "CL030",
    "CL103",
    "CL105",
    "CL109",
    "CL110",
    "CL111",
    "CL114",
    "CL115",
    "CL116",
    "CL118",
    "CL119",
    "CL121",
    "CL122",
    "CL123",
    "CL124",
    "CL125",
    "CL127",
    "CL128",
    "CL129",
    "CL130",
    "CL131",
    "CL138",
    "CL139",
    "CL140",
    "CL141",
    "CL143",
    "CL144",
    "CL145",
    "CL146",
    "CL147",
    "CL148",
    "CL152",
    "CL154",
    "CL156",
    "CL164",
    "CL169",
    "CL178",
    "CL182",
    "CL184",
    "CL186",
    "CL188",
    "CL190",
    "CL192",
    "CL196",
    "CL197",
    "CL198",
    "CL199",
    "CL200",
    "CL201",
    "CL202",
    "CL203",
    "CL204",
    "CL205",
    "CL206",
    "CL207",
    "CL208",
    "OTHERSWWW"
]

db.getCollection('tickets').find({}).forEach( function(doc){
    db.getCollection('vins').find({vin:doc.vin, date_runt})
})

// Actualización de la versión para los TMOG desde enero de 2019

db.getCollection('tmogs').find({date:{$gte:201901}}).forEach( function(item){
    db.getCollection('tmogs').update({_id:item._id}, { $set:{ "version":"TMOG-2019-01"}} )
} )

db.getCollection('refs').find({model:"SC"}).forEach( function(item){
    db.getCollection('refs').update({_id:item._id}, { $set:{ "displacement":item.displacement.toString() }})
} )



db.getCollection('dcsis').find({date:{ $gte:20190800}, cod_dealer:"CL204" }).forEach( function(doc){
    db.getCollection('dcsis').update({_id:doc._id}, { $set:{"cod_dealer":"CL206"}})
})


db.getCollection('rpgs').find({}).forEach( function(item){
    db.getCollection('rpgs').update({_id: item._id}, { $set:{"year_month_approval": parseInt(item.year_month_approval) }})
} )

db.getCollection('dcsis').find({advisorId:"1010226234", date:{ $gte:20190900 }}).forEach( function(item){
    db.getCollection('dcsis').update({_id:item._id}, { $set:{"advisorId":"desconocido"}} )
} )


//Actualización de las referencias de mantenimiento prepagado

db.getCollection('refs').find({}).forEach( function(item){
    db.getCollection('refs').update({_id:item._id}, { $set:{ "active":true, "edit":false }})
} )

//Actualización de referencia Caneca por Cuarto

db.getCollection('refs').find({description:"CANECA ACEITE 5W/30 MAAPA"}).forEach( function(item){
    db.getCollection('refs').update({_id:item._id}, { $set:{ "ref":"GSB027Q", "description":"ACEITE 5W / 30 CUARTOS", "pvc":12600, "pvp":17700 }})
})

//Actualización de los temparios por modelo
db.getCollection('modeltemplatemants').find({}).forEach( function(item){
    db.getCollection('modeltemplatemants').update({_id:item._id}, { $set:{ 'active':true }})
} )