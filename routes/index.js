'use strict'

const express = require('express')
const moment = require('moment')
const UserController = require('../controllers/userController')
const VsrController = require('../controllers/vsrController')
const DealerController = require('../controllers/dealerController')
const VinController = require('../controllers/vinController')
const VersionController = require('../controllers/versionController')
const ModelController = require('../controllers/modelController')
const DownLoadController = require('../controllers/downLoadController')
const TicketController = require('../controllers/ticketController')
const MailerController = require('../controllers/mailerController')
const ClinicController = require('../controllers/clinicController')
const ClinicReqController = require('../controllers/clinicReqController')
const DcsiSurveyController = require('../controllers/dcsiSurveyController')
const DcsiALT = require('../controllers/dcsiControllerALT')
const KotController = require('../controllers/kotController')
const DBContronller = require('../controllers/dbController')
const dcsiControllerMOD = require('../controllers/dcsiControllerMOD')
const upLoadController = require('../controllers/upLoadController')
const industryController = require('../controllers/industryReportController')
const tmogController = require('../controllers/tmogController')
const compromiseController = require('../controllers/compromiseController')
const teamController = require('../controllers/teamController')
const tmogEvaluationController = require('../controllers/tmogEvaluationController')
const HistoryController = require('../controllers/historyController')
const KpiController = require('../controllers/kpiController')
const RetentionController = require('../controllers/retentionController')
const VinHistoyController = require('../controllers/vinHistoryController')
const OthersController = require('../controllers/othersController')
const surveyServiceController = require('../controllers/serviceSurveyController')
const budgetWarranty = require('../controllers/budgetWarrantyController')
const warrantyReports = require('../controllers/warrantyReports')
const dcsiDealer = require('../controllers/dcsiDealer')
const partsDownController = require('../controllers/partsDownController')
const referenceController = require('../controllers/referencesController')
const modelTemplateController = require('../controllers/modelTemplateMantController')
const variablesController = require('../controllers/variablesController')
const PrepaidController = require('../controllers/prepaidController')

const VinFilterController = require('../controllers/vinFilterController')
const SimulatorController = require('../controllers/prepaid_mant/simulatorController')
const OrderController = require('../controllers/prepaid_mant/orderController');

const cardsRequisition = require('../controllers/prepaid_mant/cardsRequisition');
const redentionController = require('../controllers/prepaid_mant/rendetionController');
const customerInfo = require('../controllers/prepaid_mant/customerInfoController');
const complementarySevices = require('../controllers/prepaid_mant/complementaryServicesController');



const isAuth = require('../middlewares/auth')
const api = express.Router()

// Test
const test = require('../controllers/testDataController')
api.get('/test/createTest', test.createTest)
api.get('/test/editTest', test.editTest)
api.get('/test/getDCSI', test.getDCSI)
// fin Test

api.post('/signin', UserController.signIn)
api.post('/signup', isAuth, UserController.signUp)
api.post('/users/:userId',isAuth, UserController.upDateUser)
api.post('/users', isAuth, UserController.getUsers)
api.post('/getuserbyemail',isAuth, UserController.getUserByEmail)
api.post('/deletUser/:userId', isAuth, UserController.deletUser)

// VSR
api.post('/newVSR', isAuth, VsrController.newVsr )
api.get('/vsrs', isAuth, VsrController.getVsr )
api.post('/vsrs/:vsrId', isAuth, VsrController.upDate)

//Dealers
api.post('/dealers', isAuth, DealerController.newDealer)
api.get('/dealers', DealerController.getDealers)
api.post('/dealers/:dealerId', isAuth, DealerController.editDealer)
api.get('/dealer/dealerByZone', isAuth, DealerController.dealerByZone)
api.post('/dealer/dealerByZoneWarrantys', isAuth, DealerController.dealerByZoneWarrantys)

api.get('/dealer/dealerByGroup', isAuth, DealerController.dealerByGroup )
api.post('/dealer/dealerByDealer', DealerController.dealerByDealer)
api.post('/dealer/getDealerById', DealerController.getDealerById)
api.post('/dealer/getDealerByCity', DealerController.getDealerByCity)

api.post('/dealer/satisfactionPeriodPos', dcsiDealer.satisfactionPeriodPos)
api.post('/dealer/satisfactionPeriodPosCountry', dcsiDealer.satisfactionPeriodPosCountry)
api.post('/dealer/recommendPeriodPos', dcsiDealer.recommendPeriodPos)
api.post('/dealer/recommendPeriodPosCountry', dcsiDealer.recommendPeriodPosCountry)
api.post('/dealer/retentionPeriodPos', dcsiDealer.retentionPeriodPos)
api.post('/dealer/retentionPeriodPosCountry', dcsiDealer.retentionPeriodPosCountry)
api.post('/dealer/loyaltyPeriodPos', dcsiDealer.loyaltyPeriodPos)
api.post('/dealer/loyaltyPeriodPosCountry', dcsiDealer.loyaltyPeriodPosCountry)
api.post('/dealer/populationGener', dcsiDealer.populationGener)
api.post('/dealer/populationAge', dcsiDealer.populationAge)









//VINs
api.post('/vins/getByVin', VinController.getByVin)
api.post('/vins/getTicketByVin', TicketController.getTicketByVin)

api.post('/vins/getCountByVin', VinController.getCountByVin)
// api.post('/vins/getRetention',VinController.getDealerAv, VinController.getVioByDealer,  VinController.getRetention)
// api.post('/vins/getVioByDealer',VinController.getDealerAv, VinController.getVioByDealer, VinController.getVIObyDealer)
// api.post('/vins/getVioByModel', VinController.getVioByModel)
// api.post('/vins/getAverageModel',VinController.getModelDecoder, VinController.getTypes,  VinController.getAverageModel)
// api.post('/vins/getModelByInitWarranty', VinController.getModelByInitWarranty)
// api.post('/vins/getAverageTimeModel',VinController.getModelDecoder, VinController.getAverageTimeModel)
// api.post('/vins/getUseTypes', VinController.getUseTypes)

// api.post('/vins/originReport', VinController.originReport)
// api.post('/vins/getVioByCity', VinController.getCitys, VinController.getVioByCity)
api.post('/vins/getCityFilter', VinController.getCitys, VinController.getCityFilter)
// api.post('/vins/getVioPerDate',VinController.getModelDecoder, VinController.getVioPerDate)
// api.post('/vins/getVioPerDateVariation', VinController.getVioPerDateVariation)
api.post('/vins/srgListByVin', VinController.srgListByVin)
api.post('/vins/pwaListByVin', VinController.pwaListByVin)
api.post('/vins/dcsiListByVin', VinController.dcsiListByVin)
api.post('/vins/kacsByVin', VinController.kacsByVin)
api.post('/vins/retentionByVin', VinController.retentionByVin)
api.post('/vins/recommendByVin', VinController.recommendByVin)
api.post('/vins/loyaltyByVin', VinController.loyaltyByVin)
api.post('/vins/frftByVin', VinController.frftByVin)






api.post('/vins/getKeys', VinController.getKeys)
api.post('/vins/getByJustVin', VinController.getByJustVin)
api.post('/vins/getCountByJustVin', VinController.getCountByJustVin)
api.post('/vins/getVinById', VinController.getVinById)


//Version
api.post('/version',isAuth, VersionController.newVersion)
api.get('/versions',isAuth, VersionController.getAllVersion )


//Models
api.get('/models', isAuth, ModelController.getModels)
api.post('/newModels', isAuth, ModelController.newModel)
api.post('/deletModel/:_id', isAuth, ModelController.deletModel)
api.post('/models/uploadImg', ModelController.uploadImg)
api.post('/models/getGroupModels', ModelController.getGroupModels)
api.post('/models/searchModel', ModelController.searchModel)


//DownLoads
api.get('/downloadExcel', DownLoadController.exportExcel)
// api.get('/test', DownLoadController.test)
api.post('/setFilters', isAuth, DownLoadController.setFilters)

//Mailer
api.get('/mail/test', MailerController.sendEmailTest)
api.post('/mail/getNewPass',MailerController.getNewPass)

//Clinic
api.post('/clinic/new',isAuth, ClinicController.newClinic)
api.post('/clinics',isAuth, ClinicController.getClinic)
api.get('/clinics/count',isAuth, ClinicController.getLength)
api.post('/clinics/:clinicId',isAuth, ClinicController.deletClinic)
api.post('/clinic/:clinicId',isAuth, ClinicController.getOneClinic)
api.get('/clinics/advisor',isAuth, ClinicController.getClinicForAdvisor)

//Register Clinic
api.post('/registerClinicVisit', isAuth, ClinicReqController.newClinicReq)
api.post('/registerClinicVisit/getByClinic/:clinicId',isAuth, ClinicReqController.getReqFromClinics)
api.post('/registerClinicVisit/resume/:clinicId',isAuth, ClinicReqController.getReqResumen)
api.post('/clinic/report/getByGroup/:clinicId',isAuth,ClinicReqController.getByGroup )
api.post('/clinic/report/getDetailByGroup/:clinicId',isAuth, ClinicReqController.getDetailByGroup)

//Report General Clinic
api.post('/clinic/report/general', ClinicReqController.reportClinicResume)
api.post('/clinic/report/general/cot', ClinicReqController.reportCotizaciones)
api.post('/clinic/report/general/byClinic', ClinicReqController.getReportByClinic)

//DCSI

//DCSI ALT
api.post('/report/getPer', DcsiALT.getPer)
api.post('/report/kacsGeneral_alt', DcsiALT.kacsGeneral)
api.post('/report/satisfactionIndKacs', DcsiALT.satisfactionIndKacs)
api.post('/report/satisfactionIndFRFT', DcsiALT.satisfactionIndFRFT)
api.post('/report/satisfactionIndLoyalty', DcsiALT.satisfactionIndLoyalty)
api.post('/report/getKacsResultALT', DcsiALT.getKacsResult)
api.post('/report/getKacsResultTrimonthALT', DcsiALT.getKacsResultTrimonth)
api.post('/report/loyaltyPerDealer', DcsiALT.loyaltyPerDealer)
api.post('/report/getKascDetailsALT', DcsiALT.getKascDetails)
api.post('/report/getRevisitDetailsALT', DcsiALT.getRevisitDetails)
api.post('/report/getRecommendDetailsALT', DcsiALT.getRecommendDetails)
api.post('/report/getFrftByDealerALT', DcsiALT.getFrftByDealer)
api.post('/report/getFrftOffendersALT', DcsiALT.getFrftOffenders)
api.post('/report/getfrftTopOffendersALT', DcsiALT.getfrftTopOffenders)
api.post('/report/getkacsAverage', DcsiALT.getkacsAverage)
api.post('/report/getLoyaltyAverage', DcsiALT.getLoyaltyAverage)
api.post('/report/getFrftAverage', DcsiALT.getFrftAverage)

api.post('/report/getKotPerDealer', KotController.getKotPerDealer)
api.post('/report/kacsGroup', DcsiALT.kacsGroup)
api.post('/report/loyaltyGroup', DcsiALT.loyaltyGroup)
api.post('/report/frftGroup', DcsiALT.frftGroup)


api.post('/report/getPromoterScore', DcsiALT.getPromoterScore)
api.post('/report/getRetentionRate', DcsiALT.getRetentionRate)
api.post('/report/getAvgNPSScore', DcsiALT.getAvgNPSScore)
api.post('/report/getFLCRate', DcsiALT.getFLCRate)
api.post('/report/getFLCRateCountry', DcsiALT.getFLCRateCountry)
api.post('/report/getFLCEnhancedRate', DcsiALT.getFLCEnhancedRate)
api.post('/report/getFLCEnhancedRateCountry', DcsiALT.getFLCEnhancedRateCountry)
api.post('/report/getNPSRetention', DcsiALT.getNPSRetention)
api.post('/report/getNPSRetentionCountry', DcsiALT.getNPSRetentionCountry)
api.post('/report/getFLCHistoy', DcsiALT.getFLCHistoy)
api.post('/report/getFLCEnhancedHisotry', DcsiALT.getFLCEnhancedHisotry)
api.post('/report/getFLCEnhancedHisotryCountry', DcsiALT.getFLCEnhancedHisotryCountry)
api.post('/report/getKacsDetails', DcsiALT.getKacsDetails)
api.post('/report/getKacsDetailsAverage', DcsiALT.getKacsDetailsAverage)
api.post('/report/getKpiByAdvisor',DcsiALT.getTeamById, DcsiALT.getDealers, DcsiALT.getKpiByAdvisor)



// DCSI History
api.post('/report/getKpiHistoy',HistoryController.getDealers, HistoryController.getColors, HistoryController.getKpiHistoy)

//KOT Kia On Time
api.post('/uploads/newKot', KotController.addKot)
api.post('/report/getSendPerDealer', KotController.getSendPerDealer)
api.post('/report/getPointsperDealer', KotController.getPointsPerDealer)
api.post('/report/getPhotoPerDealer', KotController.getPhotoPerDealer)
api.post('/report/getVideoPerDealer', KotController.getVideoPerDealer)
api.post('/report/getTimePerDealer', KotController.getTimePerDealer)

api.post('/report/getAvg', KotController.getAvg)
api.post('/report/getAvgUso', KotController.getAvgUso)
api.post('/report/getAvgCountry', KotController.getAvgCountry)
api.post('/report/getKotGroup', KotController.getKotGroup)

//DCSI Survey
api.post('/survey/getSurveys', DcsiSurveyController.getSurveys)
api.post('/survey/newQuestion', DcsiSurveyController.newQuestion )
api.post('/survey/getSurveyList', DcsiSurveyController.getSurveyList)
api.post('/survey/updateQuestion', DcsiSurveyController.updateQuestion)
api.post('/survey/deletQuestion', DcsiSurveyController.deletQuestion)


//DataBase
api.post('/database/getPer',isAuth, DBContronller.getPer)
api.post('/database/getDealer',isAuth, DBContronller.getDealer)
api.post('/database/getDcsi',isAuth, DBContronller.getDcsi)
api.post('/database/getDCSIData',isAuth, DBContronller.getDCSIData)
api.post('/database/getDCSIDataCount',isAuth, DBContronller.getDCSIDataCount)
api.post('/database/deleteDCSIData', isAuth, DBContronller.deleteDCSIData)
api.post('/database/deletDupliesDCSIData', isAuth, DBContronller.deletDupliesDCSIData)
api.post('/database/getTicketData', isAuth, DBContronller.getTicketData)
api.post('/database/getTicketDataCount', isAuth, DBContronller.getTicketDataCount)
api.post('/database/deletTicketsData', isAuth, DBContronller.deletTicketsData)




api.get('/private', function(req, res){
    res.status(200).send({message:'Tienes acceso'})
})

//Dcsi By Models
api.post('/reportModel/kascByModel',isAuth, dcsiControllerMOD.getModels, dcsiControllerMOD.getDealer, dcsiControllerMOD.kascByModel)
api.post('/reportModel/frftByModel',isAuth, dcsiControllerMOD.getModels, dcsiControllerMOD.frftByModel)
api.post('/reportModel/frftByModelCountry',isAuth, dcsiControllerMOD.getModels, dcsiControllerMOD.frftByModelCountry)
api.post('/reportModel/kascByModelCountry',isAuth, dcsiControllerMOD.getModels, dcsiControllerMOD.kascByModelCountry)
api.post('/reportModel/kacsDetails',isAuth, dcsiControllerMOD.getModels, dcsiControllerMOD.kacsDetails)
api.post('/reportModel/kacsDetailsCountry', isAuth, dcsiControllerMOD.getModels, dcsiControllerMOD.kacsDetailsCountry)
api.post('/reportModel/getFilterModel',isAuth, dcsiControllerMOD.getFilterModel)

//Uploads
api.post('/uploads/dcsi', isAuth, upLoadController.dcsiUploads)
api.post('/uploads/vins', isAuth, upLoadController.vinsUploads)
api.post('/uploads/ticket', isAuth, upLoadController.ticketUploads, upLoadController.addMaintenanceToVin)
api.post('/uploads/industryUploads', isAuth, upLoadController.industryUploads)
api.post('/uploads/srgUploads', isAuth, upLoadController.srgUploads)
api.post('/uploads/pwaUploads', isAuth, upLoadController.pwaUploads)
api.post('/uploads/aftersalesUploads', isAuth, upLoadController.aftersalesUploads)
api.post('/uploads/aftersalesUploadsDetails', isAuth, upLoadController.aftersalesUploadsDetails)

api.post('/uploads/removeSRGPending', isAuth, upLoadController.removeSRGPending)
api.post('/uploads/srgPendingUploads', isAuth, upLoadController.srgPendingUploads)


api.post('/uploads/removePWAPending', isAuth, upLoadController.removePWAPending)
api.post('/uploads/pwaPendingUploads', isAuth, upLoadController.pwaPendingUploads)
api.post('/uploads/partsDownUploads', isAuth, upLoadController.partsDownUploads)




// Income Industry report
api.get('/industry/incomeReportAVGByDealer',industryController.getDealer, industryController.incomeReportAVGByDealer)
api.get('/industry/incomeReportAVGByDate', industryController.incomeReportAVGByDate )
api.post('/industry/incomeReportTotalByDealer',industryController.getDealer, industryController.incomeReportTotalByDealer)
api.post('/industry/incomeReportTotalByDate', industryController.incomeReportTotalByDate)

api.post('/industry/getPer', industryController.getPer)

// TMOG
api.post('/tmog/createCategory', tmogController.createCategory)
api.post('/tmog/upDateCategory', tmogController.upDateCategory)
api.post('/tmog/deletCategory', tmogController.deletCategory)
api.post('/tmog/getVersionFilter', tmogController.getVersionFilter)
api.post('/tmog/getCategoryByVersion', tmogController.getCategoryByVersion)
api.post('/tmog/createItem', tmogController.createItem)
api.post('/tmog/getItemsVersion', tmogController.getItemsVersion)
api.post('/tmog/updateItem', tmogController.updateItem)
api.post('/tmog/getItemToQuestionaire', tmogController.getTMOGQuestionarie, tmogController.getItemToQuestionaire)
api.post('/tmog/uploadFile', tmogController.uploadFile)
api.post('/tmog/deleFile', tmogController.deleFile)
api.post('/tmog/saveTMOGEvaluation',tmogController.getDealer, tmogController.getMemberTeam, tmogController.saveTMOGEvaluation)
api.post('/tmog/createTMOGAsnwer', tmogController.createTMOGAsnwer)
api.post('/tmog/getTMOGEvaluation',tmogController.getDealer, tmogController.getTMOGEvaluation)
api.post('/tmog/getGlossary', tmogController.getGlossary)
api.post('/tmog/getGlossaryCategory', tmogController.getGlossaryCategory)


api.post('/tmog/getEvaluationById', tmogController.getEvaluationById)
api.post('/tmog/getResumeTMOG', tmogEvaluationController.getResumeTMOG)
api.post('/tmog/getDateTMOG', tmogEvaluationController.getDateTMOG)


//Compromise
api.post('/compromise/newCompromise',isAuth, compromiseController.newCompromise)
api.post('/compromise/getCompromiseByTMOG',isAuth, compromiseController.getCompromiseByTMOG)
api.post('/compromise/editCompromise',isAuth, compromiseController.editCompromise)
api.post('/compromise/getKpiCompromise', compromiseController.getKpiCompromise)
api.post('/compromise/getCompromiseByEvaluation', compromiseController.getCompromiseByEvaluation)
api.post('/compromise/getCopromiseByDealer', compromiseController.getCopromiseByDealer)
api.post('/compromise/getCompromiseCount', compromiseController.getCompromiseCount)
api.post('/compromise/getUserFilter', compromiseController.getUserFilter)

// Team
api.post('/team/createMemberTeam', teamController.createMemberTeam)
api.post('/team/editMemberTeam', teamController.editMemberTeam)
api.post('/team/deletMemberTeam', teamController.deletMemberTeam)
api.post('/team/getMemberTeam', teamController.getMemberTeam)
api.post('/team/getMembersByFilter', teamController.getMembersByFilter)
api.post('/team/getCountMembersByfilter', teamController.getCountMembersByfilter)
api.post('/team/uploadImgProfile', teamController.uploadImgProfile)
api.post('/team/deletFile', teamController.deletFile)

//TMOG Evaluation
api.post('/tmogEva/mobileYear', tmogEvaluationController.getDealersAv, tmogEvaluationController.mobileYear)
api.post('/tmogEva/getPeriod', tmogEvaluationController.getPeriod)
api.get('/test', function (req, res){
    // moment.locale('es')
    let data = 'Bien hecho Chamaco perro >:V';
    
    // let data = moment().day(0)
    res.status(200).send(data)
})

// KPI Settings
api.post('/kpi/newKpi', KpiController.newKpi)
api.post('/kpi/getKpi', KpiController.getKpi)
api.post('/kpi/updateKpi', KpiController.updateKpi)
api.post('/kpi/getDCSICodes', KpiController.getDCSICodes)
api.post('/kpi/newColor', KpiController.newColor)
api.post('/kpi/getColors', KpiController.getColors)
api.post('/kpi/editColor', KpiController.editColor)
api.post('/kpi/deletKpi', KpiController.deletKpi)

// temp route
// api.get('/addmain', upLoadController.addMaintenanceToVin)

// Ticket
api.post('/ticket/ticketControlUpload', TicketController.getDealer, TicketController.ticketControlUpload)
api.post('/ticket/distributionUseType', TicketController.distributionUseType)
api.post('/ticket/kmMonthByCity',TicketController.getDealerByCity, TicketController.kmMonthByCity)
api.post('/ticket/kmMonthByModel',TicketController.getModelCod, TicketController.kmMonthByModel)
api.post('/retention/getUIWByDate',RetentionController.getDealer, RetentionController.getTicket, RetentionController.getTicketSales, RetentionController.getUIWByDate)

api.post('/retention/getTicketsTwoTimeOnYear',RetentionController.getDealer, RetentionController.getTicketsTwoTimeOnYear, RetentionController.getTicketsTwoTimeOnYearSales, RetentionController.getUIWByDate)
api.post('/retention/getTicketByModel',RetentionController.getModels, RetentionController.getUIWByDateModel, RetentionController.getTicketByModel, RetentionController.RetentetionByModel)
api.post('/ticket/getTicketByTypeIn', TicketController.getTicketByTypeIn)
api.post('/retention/typeInByKilometers', RetentionController.typeInByKilometers)
api.post('/retention/getDistinctUse', RetentionController.getDistinctUse)
api.post('/retention/getRetentionByYearOperation', 
	RetentionController.getTicketByOperationYear, 
	RetentionController.getVIOByYearOperation, 
	RetentionController.getTicketByOperationYearSales, 
	RetentionController.getRetentionByYearOperation)

// api.get('/retention/addRegIntToVin', VinHistoyController.addRegIntToVin)
api.post('/retention/getCountVinByYears', VinHistoyController.getCountVinByYears)
api.post('/retention/setVinHistoryManual', VinHistoyController.setVinHistoryManual)

api.get('/retention/getDataRetention', RetentionController.getDataRetention)
api.get('/retention/getDataRetentionByYear', RetentionController.getDataRetentionByYear)
api.get('/retention/getDataRetentionByYearAndDealer', RetentionController.getDataRetentionByYearAndDealer)


//Encuestas de servicio
api.post('/surveyService/createSurvey', surveyServiceController.createSurvey, surveyServiceController.getReceivers)
api.post('/surveyService/createSurveyToLink', surveyServiceController.createSurveyToLink, surveyServiceController.getShortLink)
api.post('/surveyService/getSurveyById', surveyServiceController.getSurveyById)
api.post('/surveyService/updateSurvey', surveyServiceController.updateSurvey, surveyServiceController.getReceivers)

// Warranty reports
// others crud
api.post('/others/createOthers', OthersController.createOthers)
api.post('/others/getOthers', OthersController.getOthers)
api.post('/others/updateOthers', OthersController.updateOthers)
api.post('/others/deletOthers', OthersController.deletOthers)
api.post('/others/createParts', OthersController.createParts)
api.post('/others/deletParts', OthersController.deletParts)
api.post('/others/getPartsByIdResponsable', OthersController.getPartsByIdResponsable)


// Reporte de Encuestas de servicio en servicio
// api.get('/surveys/getDealerCity', surveyServiceController.getDealerCity)
api.post('/surveyService/getSurveysResult', surveyServiceController.getSurveysResult)
api.post('/surveyService/getSurveysNPS', surveyServiceController.getSurveysNPS)
api.post('/surveyService/getQuestions', surveyServiceController.getDealers, surveyServiceController.getQuestions)
api.post('/surveyService/surveysByDealer',surveyServiceController.getDealers, surveyServiceController.surveysByDealer)


// Reporte de Garantías
// construccion de Presupuestos

// api.get('/warrantyReports/getOthersBySetBudget', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts)

api.get('/warrantyReports/getValueByOthersGroupDate', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.getValueByOthersGroupDate, warrantyReports.sendOthersReport)
api.get('/warrantyReports/getBudget', warrantyReports.getBudget)
api.get('/warrantyReports/getConsumed', warrantyReports.getOtherNoSetBusget, warrantyReports.getPartsNoSetBudget, warrantyReports.getConsumed)
api.get('/warrantyReports/getDealersByWarrantyZone', warrantyReports.getDealersByWarrantyZone)
api.get('/warrantyReports/getConsumedByDealer', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.getConsumedByDealer)
api.get('/warrantyReports/getTotalWarrantyDate', warrantyReports.getOtherNoSetBusget, warrantyReports.getPartsNoSetBudget, warrantyReports.getTotalWarrantyDate)
api.get('/warrantyReports/getTotalCampaingDate', warrantyReports.getOtherNoSetBusget, warrantyReports.getPartsNoSetBudget, warrantyReports.getTotalCampaingDate)
api.get('/warrantyReports/getModels', warrantyReports.getModels)
api.get('/warrantyReports/getOrigins', warrantyReports.getOrigins)
api.get('/warrantyReports/getDealerOrigin', warrantyReports.getDealerOrigin)



//PWA
api.get('/warrantyReports/amountClaimsDealer', warrantyReports.amountClaimsDealer)
api.get('/warrantyReports/pwaTimeAverage', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.pwaTimeAverage)
// api.get('/warrantyReports/pwaTimeAverageOThers', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.pwaTimeAverageOThers)
//SRG
api.get('/warrantyReports/srgTimeAverage', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.srgTimeAverage)

api.post('/warrantyReports/pwaPendingTimeAverage', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.pwaPendingTimeAverage)
api.post('/warrantyReports/srgPendingTimeAverage', warrantyReports.getOthersBySetBudget, warrantyReports.getAllParts, warrantyReports.srgPendingTimeAverage)

api.get('/warrantyReports/courtesyEvaluation', warrantyReports.getDCSI, warrantyReports.getTickets, warrantyReports.courtesyEvaluation)
api.post('/partsDown/uploadFile', partsDownController.uploadFile)
api.post('/partsDown/deleFile', partsDownController.deleFile)

 
api.get('/warrantyReports/fakeData', budgetWarranty.fakeData)
api.get('/projection/getAllTickets', TicketController.getAllTickets)

api.get('/frequency', test.getFrequency)






// Prepaid Manteinance
api.post('/prepaidMant/reference/create', isAuth, referenceController.create)
api.post('/prepaidMant/reference/getReferences', referenceController.getReferences)
api.post('/prepaidMant/reference/getCountReference', referenceController.getCountReference)
api.post('/prepaidMant/reference/updateReference', referenceController.updateReference)
api.post('/prepaidMant/reference/getReferencesByModel', referenceController.getReferencesByModel)


// Model Template Manteinance
api.post('/prepaidMant/modelTemplate/create', modelTemplateController.create)
api.post('/prepaidMant/modelTemplate/getModelTemplate', modelTemplateController.getModelTemplate)
api.post('/prepaidMant/modelTemplate/getCountModelTemplate', modelTemplateController.getCountModelTemplate)
api.post('/prepaidMant/modelTemplate/update', modelTemplateController.update)
api.post('/prepaidMant/modelTemplate/getModelTemplateByDealer', modelTemplateController.getModelTemplateByDealer)


// Variables
api.post('/prepaidMant/variables/create', variablesController.create)
api.post('/prepaidMant/variables/getVariable', variablesController.getVariable)
api.post('/prepaidMant/variables/updateVariable', variablesController.updateVariable)
api.post('/prepaidMant/variables/deletVariable', variablesController.deletVariable)

//Plantilla principal mantenimiento prepagado
api.post('/prepaidMant/prepaidTemplate/create', PrepaidController.create)
api.post('/prepaidMant/prepaidTemplate/getPrepaidTemplates', PrepaidController.getPrepaidTemplates)
api.post('/prepaidMant/prepaidTemplate/updatePrepaidTemplates', PrepaidController.updatePrepaidTemplates)
api.post('/prepaidMant/prepaidTemplate/getTemplateForSimulator', PrepaidController.getTemplateForSimulator)

// Vin Filter Controller
api.post('/prepaidMant/VinFilter/getFilterModels', VinFilterController.getFilterModels)
api.post('/prepaidMant/VinFilter/getAvailableVersion', VinFilterController.getAvailableVersion)
api.post('/prepaidMant/VinFilter/validationVersion', VinFilterController.validationVersion)
api.get('/searchByVin', VinFilterController.getVinData, VinFilterController.getVinByPlate)
api.get('/searchPlate', VinFilterController.searchPlate)


//Simulator Controller

api.post('/prepaidMant/Simulator/getProjection', 
	SimulatorController.getVAraibles, 
	SimulatorController.getModelByDealer,
	SimulatorController.getTemplateForSimulator,
	SimulatorController.getReferencesByModel,
	SimulatorController.transform)

//Pedido del Paquete de mantenimiento
api.post('/prepaidMant/order/create', OrderController.create);
api.post('/prepaidMant/order/getOrders', OrderController.getOrders);
api.post('/prepaidMant/order/getOrderById', OrderController.getOrderById);
api.post('/prepaidMant/order/uploadFile', OrderController.uploadFile);
api.post('/prepaidMant/order/upDateOrder', OrderController.getAdmins, OrderController.upDateOrder);
api.post('/prepaidMant/order/searchOrderByVin', OrderController.searchOrderByVin);

//Redention Mantenimiento Prepagado
api.post('/prepaidMant/redention/getActives', redentionController.getActives)
api.post('/prepaidMant/redention/getToRedeem', redentionController.getToRedeem)

//Consulta de clientes

api.get('/prepaidMant/customer/customerInfo', customerInfo.getDataForCustomer)
api.get('/prepaidMant/customer/getOrderToCustomer', customerInfo.getOrderToCustomer)
api.post('/prepaidMant/customer/redeemNotification', customerInfo.getDealers, customerInfo.redeemNotification)

// Servicios complementarios

api.post('/prepaidMant/complementaryServices/create', complementarySevices.create)
api.post('/prepaidMant/complementaryServices/read', complementarySevices.read)
api.post('/prepaidMant/complementaryServices/update', complementarySevices.update)









module.exports = api
