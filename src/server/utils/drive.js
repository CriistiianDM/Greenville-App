const ROOT_FOLDER = 'ZONES';
const FILES_FOLDER = 'Storage';
const FILES_COMMENTS = 'Comments';

function base64ToBlob(fileName, fileData) {
  const contentType = fileData.substring(5, fileData.indexOf(';'));
  const bytes = Utilities.base64Decode(
    fileData.substr(fileData.indexOf('base64,') + 7)
  );
  const blob = Utilities.newBlob(bytes, contentType, fileName);
  return blob;
}



function findOrCreateFolder(name, folder2search ) {
  let folder;
    console.log('folder2search Nuevo', name)

    const url_folder = (name.split('|')[1] === undefined)? name : name.split('|')[1];
    console.log('url_folder', url_folder);
    //exprecion regular para saber si es una url
    const regex = new RegExp('https://drive.google.com/drive/folders/([a-zA-Z0-9-_]+)');
    const match = url_folder.match(regex);
  
    if (match) {

      const allFolders = folder2search.getFolders();
      
      while (allFolders.hasNext()) {
          const potentialFolder = allFolders.next();
         
          if (potentialFolder.getUrl() === url_folder) {
            folder = potentialFolder;
            break;
          }
      }

    }

    if (!folder && !match)  {
      console.log('Entre A crear carpeta');
      const folderName = name.includes('|') ? name.split('|')[0] : name;
      const folders = folder2search.getFoldersByName(folderName);
      if (folders.hasNext()) folder = folders.next();
      else { folder = folder2search.createFolder(folderName); }
    }

  return folder;
}

function getMainFolder() {
  const mainFolder = findOrCreateFolder(ROOT_FOLDER, DriveApp);
  return mainFolder;
}

function getFilesFolder(folder) {
  let mainFolder = folder;
  if (!folder) mainFolder = getMainFolder();

  const filesFolder = findOrCreateFolder(FILES_FOLDER, mainFolder);
  return filesFolder;
}

function getCommentsFolder(folder) {
  let mainFolder = folder;
  if (!folder) mainFolder = getFilesFolder();
  const commentsFolder = findOrCreateFolder(FILES_COMMENTS, mainFolder);
  return commentsFolder;
}

function getZoneFolder(zone) {
  const filesFolder = getFilesFolder();
  const zoneFolder = findOrCreateFolder(zone, filesFolder);
  return zoneFolder;
}

function getFileGroupFolder({ group, zone, idHouse }) {
  const zoneFolder = getZoneFolder(zone);
  const houseFolder = findOrCreateFolder(idHouse, zoneFolder);
  const fileGroupFolder = findOrCreateFolder(group, houseFolder);
  return fileGroupFolder;
}

export function getHouseFolder({ idHouse, zone}) {
  const zoneFolder = getZoneFolder(zone);
  const houseFolder = findOrCreateFolder(idHouse, zoneFolder);
  return houseFolder;
}

export function getHouseCommentsFolder({ id, idComment, zone }) {
  const houseFolder = getHouseFolder({ idHouse: id, zone });
  const commentsFolder = getCommentsFolder(houseFolder);
  const _bug_ = 'bug'
  const commentFolder = findOrCreateFolder(`${idComment}`, commentsFolder);
  return commentFolder;
}

function createDriveFile({ id, folder, blob }) {
  const result = {
    url: '',
    name: '',
  };
  const file = folder.createFile(blob);
  const guessEmail = global.getCurrentUser();
  file.setDescription(`Uploaded by ${guessEmail} - House ${id}`);
  result.url = file.getUrl();
  result.name = file.getName();
  return result;
}

export function createHouseFile({ fileName, id, fileData, zone, group }) {
  const currentFolder = getFileGroupFolder({ idHouse: id, zone, group });
  const blob = base64ToBlob(fileName, fileData);
  const result = createDriveFile({ id, blob, folder: currentFolder });
  return result;
}

export function createHouseCommentFile({
  id,
  zone,
  fileName,
  fileData,
  idComment,
}) {
  const currentFolder = getHouseCommentsFolder({ id, idComment, zone });
  const blob = base64ToBlob(fileName, fileData);
  const result = createDriveFile({ id, blob, folder: currentFolder });
  return result;
}

function mapHouseFiles({ idHouse, files, createFile, ...options }) {
  const savedFiles = files.map(file => {
    const name = file.name || '';
    const base64 = file.base64 || '';
    Logger.log(name);
    const savedFile = createFile({
      fileName: name,
      id: idHouse,
      fileData: base64,
      ...options,
    });
    return savedFile;
  });
  return savedFiles;
}

export function uploadHouseCommentsFiles({ idComment, idHouse, files, zone }) {
  Logger.log(
    `=======UPLOADING HOUSE ${idHouse} - Comment: ${idComment} - Zone: ${zone} COMMENTS FILES======`
  );
  if (!files.length) return null;
  const savedFiles = mapHouseFiles({
    idHouse,
    files,
    zone,
    idComment,
    createFile: createHouseCommentFile,
  });
  const currentFolder = getHouseCommentsFolder({
    id: idHouse,
    idComment,  
    zone,
  });
  const response = { files: savedFiles, folder: currentFolder.getUrl() };
  Logger.log('FILES RESPONSE:');
  Logger.log(response);
  Logger.log(`=======END UPLOADING HOUSE${idHouse} COMMENTS FILES========`);
  return response;
}

export function uploadHouseFiles({ idHouse, zone, group, files}) {
  Logger.log(`=======UPLOADING HOUSE ${idHouse} FILES ======`);
  
  if (!files.length) return null;
  const options = {
    idHouse,
    files,
    zone,
    group,
    createFile: createHouseFile,
  };
  const savedFiles = mapHouseFiles(options);
  const currentFolder = getHouseFolder({ idHouse, zone });

  const response = { files: savedFiles, folder: currentFolder.getUrl() };
  Logger.log('FILES RESPONSE:');
  Logger.log(response);
  
  
 
  Logger.log(`=======END UPLOADING HOUSE${idHouse} FILES========`);
  return response;
}
