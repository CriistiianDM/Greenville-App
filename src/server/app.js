export const getCurrentUser = () => Session.getActiveUser().getEmail();

export function isAdmin() {
  const guessEmail = getCurrentUser();
  const admins = [
    'suarez.andres@correounivalle.edu.co',
    'samuel.ramirez@correounivalle.edu.co',
    'hrdrywall.system@gmail.com',
    'cristian.machado@correounivalle.edu.co'
  ];
 
  const isGuessAdmin = admins.indexOf(String(guessEmail)) >= 0;

  return isGuessAdmin;
}

function createHtmlTemplate(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .setTitle('HR Drywall')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

export function doGet() {
  return createHtmlTemplate('index.html');
}

export function doPost(request) {
  Logger.log('request');
  Logger.log(request);

  if (typeof request !== 'undefined') {
    Logger.log(request);
    const params = request.parameter;
    Logger.log('params');
    Logger.log(params);
    return ContentService.createTextOutput(JSON.stringify(request.parameter));
  }
  return null;
}

function getEntityData(entity) {
  const rawEntities = global.getRawDataFromSheet(entity);
  return global.sheetValuesToObject(rawEntities);
}

function getHousesSheet() {
  Logger.log('=============Getting Houses Sheet===========');
  const sheet = global.getSheetFromSpreadSheet('HOUSES');
  const headers = global.getHeadersFromSheet(sheet);
  return { sheet, headers };
}

export function getHouseFiles(house) {
  if (!house.files) return house;
  const newHouse = { ...house };
  const { idHouse, address, zone , idHr , lastName , builder } = newHouse;
  Logger.log('newHouse');
  const folder = global.getHouseFolder({
    zone,
    idHouse: `${idHr} / ${lastName} / ${address} |${newHouse.files}`,
  });
  const subFolders = folder.getFolders();
  const houseFiles = {};
  while (subFolders.hasNext()) {
    const fileGroupFolder = subFolders.next();
    const groupName = fileGroupFolder.getName();
    const groupFiles = fileGroupFolder.getFiles();
    const files = [];
    while (groupFiles.hasNext()) {
      const file = groupFiles.next();
      files.push({ name: file.getName(), url: file.getUrl() });
    }
    houseFiles[groupName] = files;
  }
  newHouse.filesGroups = houseFiles;
  return newHouse;
}

export function getHouses() {
  return getEntityData('HOUSES');
}

export function getHouseStatuses() {
  return getEntityData('HOUSE STATUSES');
}

export function getFilesGroups() {
  return getEntityData('FILES GROUPS');
}

export function getUsers() {
  return getEntityData('USERS');
}
export function getReportData() {
  return getEntityData('REPORT');
}

export function getBuilders() {
  Logger.log('=============Getting Builders===========');
  return getEntityData('BUILDERS');
}

export function getModels() {
  Logger.log('=============Getting Models===========');
  return getEntityData('MODELS');
}

export function getZones() {
  Logger.log('=============Getting Zones===========');
  return getEntityData('ZONES');
}

export function getComments() {
  Logger.log('=============Getting Comments===========');
  return getEntityData('COMMENTS');
}

function getHousesZoneSheet(zone, sheetName) {
  Logger.log('=============Getting Houses Zone Sheet===========');
  const zones = getZones();
  Logger.log('ZONES:');
  Logger.log(zones);
  const found = zones.find(z => z.name === zone);
  if (!found || !found.sheet) {
    return { sheet: null, headers: null };
  }
  Logger.log('zone found:');
  Logger.log(found);
  const sheet = global.getSheetFromSpreadSheet(sheetName, found.sheet);
  const headers = global.getHeadersFromSheet(sheet);
  return { sheet, headers };
}

export function getCommentsSheet() {
  const sheet = global.getSheetFromSpreadSheet('COMMENTS');
  const headers = global.getHeadersFromSheet(sheet);
  return { sheet, headers };
}

function registerHouse(data) {
  Logger.log('=============Registering HOUSE===========');
  const response = { ok: false, data: null };
  const { sheet, headers } = getHousesSheet();
  const { sheet: zoneSheet, headers: zoneHeaders } = getHousesZoneSheet(
    data.zone,
    'HOUSES'
  );

  if (!zoneSheet) {
    response.data = `The zone ${data.zone} doesn't register sheet`;
    return response;
  }

  Logger.log('=============Reading Last Rows===========');
  const currentLastRow = sheet.getLastRow();
  const zoneLastRow = zoneSheet.getLastRow();
  let lastRowId = 0;
  let lastRowHrId = 0;
  if (currentLastRow > 1) {
    const [ids] = sheet.getSheetValues(currentLastRow, 1, 1, 2);
    const [zoneIds] = zoneSheet.getSheetValues(zoneLastRow, 1, 1, 2);
    [lastRowId] = ids;
    [lastRowHrId] = zoneIds;
  }
  Logger.log('lastRowId');
  Logger.log(lastRowId);
  const houseJSON = {
    ...data,
    idHouse: +lastRowId + 1,
    idHr: +lastRowHrId + 1,
    date: new Date().toString(),
  };
  const houseValues = global.jsonToSheetValues(houseJSON, headers);
  const zoneValues = global.jsonToSheetValues(houseJSON, zoneHeaders);
  zoneValues[0] = houseValues[1];
  Logger.log('HOUSE VALUES');
  Logger.log(houseValues);
  Logger.log(zoneValues);

  sheet.appendRow(houseValues);
  zoneSheet.appendRow(zoneValues);

  const valueToExtraSheet = [[
    houseJSON.idHr, houseJSON.address
  ]];

  const extraSheets = new Array(4);
  extraSheets.push('ACCOUNT RECIEVABLE');
  extraSheets.push('HANG&FINISH');
  extraSheets.push('PAINT');
  extraSheets.push('CLEANNING');
  extraSheets.forEach(sheetName => {
    const { sheet: zoneExtraSheet } = getHousesZoneSheet(data.zone, sheetName);
    Logger.log('zoneExtraSheet');
    Logger.log(sheetName);
    Logger.log(zoneExtraSheet);
    const range = zoneExtraSheet.getRange(zoneLastRow + 1, 1, 1, 2);
    range.setValues(valueToExtraSheet);
  });

  const rowsAfter = sheet.getLastRow();
  const recordInserted = rowsAfter > currentLastRow;

  if (recordInserted) {
    response.ok = true;
    response.data = houseJSON;
  }

  Logger.log('=============END Registering HOUSE===========');
  return response;
}

export function registerComment(data) {
  Logger.log('=============Registering COMMENT===========');
  const response = { ok: false, data: null };
  const { sheet, headers } = getCommentsSheet();
  const currentLastRow = sheet.getLastRow();
  let lastRowId = 0;
  if (currentLastRow > 1) {
    [lastRowId] = sheet.getSheetValues(currentLastRow, 1, 1, 1);
  }
  Logger.log(`Last Row ID: ${lastRowId}`);
  const timestamp = new Date().toString();
  const commentJSON = {
    ...data,
    user: getCurrentUser(),
    idComment: +lastRowId + 1,
    date: timestamp,
    statusDate: timestamp,
  };
  const commentValues = global.jsonToSheetValues(commentJSON, headers);
  Logger.log('COMMENT VALUES');
  Logger.log(commentValues);
  //commentValues[2] = `${commentValues[2]} - Date change status: ${JSON.parse(sessionStorage.getItem('calendar_status')).date}`;

  sheet.appendRow(commentValues);

  const rowsAfter = sheet.getLastRow();
  const recordInserted = rowsAfter > currentLastRow;

  if (recordInserted) {
    response.ok = true;
    response.data = commentJSON;
  }

  Logger.log('=============END Registering COMMENT===========');
  return response;
}

function registerEntity(table, form) {
  Logger.log(`=============Registering ${table}===========`);
  const response = { ok: false, data: null };
  const sheet = global.getSheetFromSpreadSheet(table);
  const headers = global.getHeadersFromSheet(sheet);

  const currentLastRow = sheet.getLastRow();
  let lastRowId = 0;
  if (currentLastRow > 1) {
    [lastRowId] = sheet.getSheetValues(currentLastRow, 1, 1, 1);
  }

  const entityJson = {
    id: +lastRowId + 1,
    ...form,
  };
  const entityValues = global.jsonToSheetValues(entityJson, headers);
  Logger.log(`${table} VALUES`);
  Logger.log(entityValues);

  sheet.appendRow(entityValues);
  const rowsAfter = sheet.getLastRow();
  const recordInserted = rowsAfter > currentLastRow;

  if (recordInserted) {
    response.ok = true;
    response.data = entityJson;
  }
  Logger.log(`=============END Registering ${table}===========`);
  return response;
}

function searchEntity({ name, getEntitySheet, entityId, idGetter }) {
  Logger.log(`=============Searching ${name}===========`);
  const { sheet, headers } = getEntitySheet();
  const result = {
    index: -1,
    data: null,
  };
  const { index: entityIndex } = global.findText({ sheet, text: entityId });
  Logger.log(`${name} Index ${entityIndex}`);
  if (entityIndex <= -1) return result;

  const entityRange = sheet.getSheetValues(
    +entityIndex,
    1,
    1,
    sheet.getLastColumn()
  );
  Logger.log(`${name} Range: ${entityRange.length}`);
  Logger.log(entityRange);
  const [entityData] = global.sheetValuesToObject(entityRange, headers);
  Logger.log(`${name} Data:`);
  Logger.log(entityData);
  const isSameDocument = String(idGetter(entityData)) === String(entityId);
  if (!isSameDocument) return result;

  result.index = entityIndex;
  result.data = entityData;
  Logger.log(result);
  Logger.log('=============END Searching House===========');
  return result;
}

export function searchComment(idComment) {
  return searchEntity({
    name: 'Comment',
    entityId: idComment,
    getEntitySheet: getCommentsSheet,
    idGetter: entity => entity.idComment,
  });
}

export function searchHouse(idHouse) {
  return searchEntity({
    name: 'House',
    entityId: idHouse,
    getEntitySheet: getHousesSheet,
    idGetter: entity => entity.idHouse,
  });
}

function updateEntity({
  name,
  idGetter,
  findEntity,
  serializedData,
  getEntitySheet,
}) {
  try {
    const response = { ok: false, data: null };
    const form = JSON.parse(serializedData);
    
    Logger.log(form);
    const { data, index } = findEntity(idGetter(form));
    if (!index) throw new Error(`${name} does not exists`);
    const { sheet, headers } = getEntitySheet();
    const entityRange = sheet.getRange(+index, 1, 1, sheet.getLastColumn());
    const entityData = global.jsonToSheetValues({ ...data, ...form }, headers);
    Logger.log(`${name} Data`);
    Logger.log(entityData);
    
    entityRange.setValues([entityData]);

    response.ok = true;
    response.data = entityData;
    return response;
  } catch (error) {
    Logger.log(error);
    throw new Error('Error updating house');
  }
}

export function updateHouse(serializedData) {
  return updateEntity({
    serializedData,
    name: 'House',
    findEntity: searchHouse,
    getEntitySheet: getHousesSheet,
    idGetter: entity => entity.idHouse,
  });
}

export function updateComment(serializedData) {
  return updateEntity({
    serializedData,
    name: 'House',
    findEntity: searchComment,
    getEntitySheet: getCommentsSheet,
    idGetter: entity => entity.idComment,
  });
}

// function avoidCollisionsInConcurrentAccessess() {
//   const lock = LockService.getPublicLock();
//   lock.waitLock(15000);
// }

export function createComment(formString) {
  const form = JSON.parse(formString);
  if (!form || !Object.keys(form).length) throw new Error('No data sent');
  try {
    // avoidCollisionsInConcurrentAccessess();
    Logger.log('Data for registering');
    Logger.log(form);
    const response = registerComment(form);
    Logger.log('Response');
    Logger.log(response);
    return response;
  } catch (error) {
    Logger.log('Error Registering comment');
    Logger.log(error);
    return error.toString();
  }
}

export function createModels(formString) {
  const form = JSON.parse(formString);
  if (!form || !Object.keys(form).length) throw new Error('No data sent');
  try {
    Logger.log('Data for registering');
    Logger.log(form);
    const response = registerEntity('MODELS', form);
    Logger.log('Response');
    Logger.log(response);
    return response;
  } catch (error) {
    Logger.log('Error Registering model');
    Logger.log(error);
    return error.toString();
  }
}

export function createBuilders(formString) {
  const form = JSON.parse(formString);
  if (!form || !Object.keys(form).length) throw new Error('No data sent');
  try {
    Logger.log('Data for registering');
    Logger.log(form);
    const response = registerEntity('BUILDERS', form);
    Logger.log('Response');
    Logger.log(response);
    return response;
  } catch (error) {
    Logger.log('Error Registering builder');
    Logger.log(error);
    return error.toString();
  }
}

export function createHouse(formString) {
  const form = JSON.parse(formString);
  if (!form || !Object.keys(form).length) throw new Error('No data sent');
  try {
    // avoidCollisionsInConcurrentAccessess();
    Logger.log('Data for registering');
    Logger.log(form);
    const response = registerHouse(form);
    Logger.log('Response');
    Logger.log(response);
    return response;
  } catch (error) {
    Logger.log('Error Registering House');
    Logger.log(error);
    throw error;
  }
}

export function createCalendarEvent(event_params) {
  const form = JSON.parse(event_params);
  if (!form || !Object.keys(form).length) throw new Error('No data sent');
  
  const { title, description, start_ , end_, location, email , idCalendar } = form;
  Logger.log('Data for registering');
  //mostrar la info en el log
  Logger.log(form);
  Logger.log(idCalendar);
 
  const calendar = CalendarApp.getCalendarById(idCalendar);
  const calendarId = calendar.getId();

  const resource = {
    summary: title,
    description,
    location,
    start: {
      date: start_
    },
    end: {
      date: start_
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 8 * 24 * 60 }
      ]
    }
  };

  const event = Calendar.Events.insert(resource, calendarId);

  return event;
};

export function getDataOthers() {
  return getEntityData('OTHERS');
}