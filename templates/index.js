'use strict'

function loadRetention (data){
    let  html =`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <title>Document</title>
    </head>
    <body>
        <div class="container">
            <div class="shadow-sm p-3 m-5 rounded-lg">
                <h5 class="display-1">
                    Retención
                </h5>
                <small>Ahora mismo estamos trabajando</small>
            </div>
            <div class="shadow-sm p-3 m-5 rounded-lg">
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Total VIN para procesar
                        <span class="badge badge-primary badge-pill">${data.total}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Fecha inicial del estudio
                        <span class="badge badge-primary badge-pill">${data.inicio}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Fecha final del estudio
                        <span class="badge badge-primary badge-pill">${data.final}</span>
                    </li>
                </ul>
            </div>
            <div class="shadow-sm p-3 m-5 rounded-lg">
                <h4 class="card-title">
                    Información parámertos
                </h4>
                <p>
                    <strong>fechaInicial</strong> <br>
                    Formato YYYYMMDD
                </p>
                <p>
                    <strong>fechaFinal</strong> <br>
                    Formato YYYYMMDD
                </p>
                <p>
                    <strong>Importante</strong> <br>
                    Si los parámetros de la fecha no se diliegencian, se tomará la fecha de hoy como fecha
                    final y un año atrás como fecha inicial.
                </p>
            </div>
        </div>
        <div class="shadow-sm p-3 m-5 rounded-lg">
            <h3>Consultar datos</h3>
    
            <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Retención General
                    <a href="https://localhost:3001/api/retention/getDataRetention">
                        <span class="badge badge-primary badge-pill">Retención General</span>
                    </a>
                    
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Dapibus ac facilisis in
                    <span class="badge badge-primary badge-pill">2</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Morbi leo risus
                    <span class="badge badge-primary badge-pill">1</span>
                </li>
            </ul>
        </div>
    </body>
    </html>
    `
    return html
}

module.exports = {
    loadRetention
}