var fs = require('fs');

const readFile = (filePath) => {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, (error, data) => {
      // file does not exist
      if (error && error.code === 'ENOENT') resolve('');
      // something went wrong
      if (error) reject(error);
      // success!
      resolve(data);
    });
  });
}

const writeFile = (filePath, dataToWrite) => {
  return new Promise(function (resolve, reject) {
    fs.writeFile(filePath, dataToWrite, 'utf8', function (error) {
      if (error) {
        console.log('Some error occured - file either not saved or corrupted file saved.');
        reject(error)
      } else{
        console.log('It\'s saved!');
        resolve();
      }
    });
  });
}

module.exports = {
  readFile,
  writeFile
};
