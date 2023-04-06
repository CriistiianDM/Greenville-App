import * as publicSheetFunctions from './utils/sheets';
import * as publicDriveFunctions from './utils/drive';
import * as publicMainFunction from './app';

// Expose public functions by attaching to `global`
global.doGet = publicMainFunction.doGet;
global.doPost = publicMainFunction.doPost;

// BUSINESS LOGIC FUNCTIONS
global.isAdmin = publicMainFunction.isAdmin;
global.getCurrentUser = publicMainFunction.getCurrentUser;
global.getHouses = publicMainFunction.getHouses;
global.createHouse = publicMainFunction.createHouse;
global.updateHouse = publicMainFunction.updateHouse;
global.updateComment = publicMainFunction.updateComment;
global.createComment = publicMainFunction.createComment;
global.createBuilders = publicMainFunction.createBuilders;
global.createModels = publicMainFunction.createModels;
global.getFilesGroups = publicMainFunction.getFilesGroups;
global.getUsers = publicMainFunction.getUsers;
global.getReportData = publicMainFunction.getReportData;
global.getBuilders = publicMainFunction.getBuilders;
global.getModels = publicMainFunction.getModels;
global.getZones = publicMainFunction.getZones;
global.getComments = publicMainFunction.getComments;
global.getHouseFiles = publicMainFunction.getHouseFiles;
global.getHouseStatuses = publicMainFunction.getHouseStatuses;

// DRIVE FUNCTIONS
global.createHouseFile = publicDriveFunctions.createHouseFile;
global.createHouseCommentFile = publicDriveFunctions.createHouseCommentFile;
global.uploadHouseCommentsFiles = publicDriveFunctions.uploadHouseCommentsFiles;
global.uploadHouseFiles = publicDriveFunctions.uploadHouseFiles;
global.getHouseFolder = publicDriveFunctions.getHouseFolder;
global.getHouseCommentsFolder = publicDriveFunctions.getHouseCommentsFolder;


// SPREADSHEET FUNCTIONS
global.getSheetFromSpreadSheet = publicSheetFunctions.getSheetFromSpreadSheet;
global.getRawDataFromSheet = publicSheetFunctions.getRawDataFromSheet;
global.getSheetsData = publicSheetFunctions.getSheetsData;
global.addSheet = publicSheetFunctions.addSheet;
global.findText = publicSheetFunctions.findText;
global.deleteSheet = publicSheetFunctions.deleteSheet;
global.setActiveSheet = publicSheetFunctions.setActiveSheet;
global.getHeadersFromSheet = publicSheetFunctions.getHeadersFromSheet;
global.jsonToSheetValues = publicSheetFunctions.jsonToSheetValues;
global.sheetValuesToObject = publicSheetFunctions.sheetValuesToObject;
global.getDataOthers = publicMainFunction.getDataOthers;

//calendar functions
global.createCalendarEvent = publicMainFunction.createCalendarEvent;


