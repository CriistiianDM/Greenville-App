import server from '../utils/server';

const { serverFunctions } = server;

function noFolderCreated() {
  throw new Error(
    'Somenthing went wrong creating files. It is not returning any folder.'
  );
}

// props: group, zone, files, ...etc
async function uploadFileToHouse({ idHouse, ...props }) {
  const fileFromDrive = await serverFunctions.uploadHouseFiles({
    idHouse,
    ...props,
  });
 
  if (!fileFromDrive.folder) noFolderCreated();
  return fileFromDrive;
}

async function uploadFilesToComment({ idComment, files, idHouse, zone }) {
  let commentFolder = '';
  const fileFromDrive = await serverFunctions.uploadHouseCommentsFiles({
    idComment,
    files,
    zone,
    idHouse,
  });
  console.log('fileFromDrive', fileFromDrive);
  if (!fileFromDrive.folder) noFolderCreated();
  commentFolder = fileFromDrive.folder;
  // await serverFunctions.updateComment(
  //   JSON.stringify({ files: commentFolder, idComment })
  // );
  return commentFolder;
}

async function uplaodFilesGroups({ idHouse, zone, houseFiles = [] }) {
  if (!houseFiles.length) return null;
  const [firstGroup, ...restGroups] = houseFiles;
  // Upload first group independently
  // so we can create the folder for the rest of files
  const firstResult = await uploadFileToHouse({ idHouse, zone, ...firstGroup });
  if (!restGroups || !restGroups.length) return firstResult;

  await Promise.all(
    restGroups.map(fileGroup =>
      uploadFileToHouse({ idHouse, zone, ...fileGroup })
    )
  );
  return firstResult;
}

serverFunctions.uplaodFilesGroups = uplaodFilesGroups;
serverFunctions.uploadFileToHouse = uploadFileToHouse;
serverFunctions.uploadFilesToComment = uploadFilesToComment;

export default serverFunctions;
