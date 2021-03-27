export const getCurrentUser = () => Session.getActiveUser().getEmail();
export function isAdmin() {
  const guessEmail = getCurrentUser();
  const admins = [
    'suarez.andres@correounivalle.edu.co',
    'samuel.ramirez@correounivalle.edu.co',
  ];
  Logger.log('guessEmail');
  Logger.log(guessEmail);
  const isGuessAdmin = admins.indexOf(String(guessEmail)) >= 0;
  Logger.log(isGuessAdmin);

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
  const entities = global.sheetValuesToObject(rawEntities);
  return entities;
}

function getHousesSheet() {
  const sheet = global.getSheetFromSpreadSheet('HOUSES');
  const headers = global.getHeadersFromSheet(sheet);
  return { sheet, headers };
}

export function getHouseFiles(house) {
  if (!house.files) return house;
  const newHouse = { ...house };
  const { idHouse, address, zone } = newHouse;
  Logger.log(`newHouse`, newHouse);
  const folder = global.getHouseFolder({
    zone,
    idHouse: `${idHouse} / ${address}`,
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

export function getBuilders() {
  return getEntityData('BUILDERS');
}

export function getModels() {
  return getEntityData('MODELS');
}

export function getZones() {
  return getEntityData('ZONES');
}

export function getComments() {
  return getEntityData('COMMENTS');
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
  const currentLastRow = sheet.getLastRow();
  let lastRowId = 0;
  let lastRowHrId = 0;
  if (currentLastRow > 1) {
    const [ids] = sheet.getSheetValues(currentLastRow, 1, 1, 2);
    [lastRowId, lastRowHrId] = ids;
  }
  Logger.log('lastRowId');
  Logger.log(lastRowId);
  const houseJSON = {
    ...data,
    idHouse: +lastRowId + 1,
    idHr: +lastRowHrId + 1,
  };
  const houseValues = global.jsonToSheetValues(houseJSON, headers);
  Logger.log('HOUSE VALUES');
  Logger.log(houseValues);

  sheet.appendRow(houseValues);

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
  Logger.log('lastRowId');
  Logger.log(lastRowId);
  const commentJSON = {
    ...data,
    user: getCurrentUser(),
    idComment: +lastRowId + 1,
    date: new Date().toString(),
  };
  const commentValues = global.jsonToSheetValues(commentJSON, headers);
  Logger.log('COMMENT VALUES');
  Logger.log(commentValues);

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
  const result = searchEntity({
    name: 'Comment',
    entityId: idComment,
    getEntitySheet: getCommentsSheet,
    idGetter: entity => entity.idComment,
  });
  return result;
}

export function searchHouse(idHouse) {
  const result = searchEntity({
    name: 'House',
    entityId: idHouse,
    getEntitySheet: getHousesSheet,
    idGetter: entity => entity.idHouse,
  });
  return result;
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
    Logger.log(`Submitted Form ${name} Data`);
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
  const response = updateEntity({
    serializedData,
    name: 'House',
    findEntity: searchHouse,
    getEntitySheet: getHousesSheet,
    idGetter: entity => entity.idHouse,
  });
  return response;
}

export function updateComment(serializedData) {
  const response = updateEntity({
    serializedData,
    name: 'House',
    findEntity: searchComment,
    getEntitySheet: getCommentsSheet,
    idGetter: entity => entity.idComment,
  });
  return response;
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
    Logger.log('Error Registering Student');
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
    Logger.log('Error Registering Student');
    Logger.log(error);
    return error.toString();
  }
}
