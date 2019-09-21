'use strict';
let fs = require('fs');
let readline = require('readline');

function createFile(fileName, content) {
    return new Promise((resolve, reject) => {
        if (!content) {
            content = '';
        }
        fs.writeFile(fileName, content, 'utf8', err => {
            if (err) {
                console.error(err);
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}

function writeLinesStep(fileName, lines, step, start, end, callback) {
    let tmpLines = lines.slice(start, end);
    let data = tmpLines.join('\n');
    data += '\n';
    fs.writeFile(fileName, data, {'flag': 'a'}, err => {
        if (err) {
            console.error(err);
            callback({success: false, err: err});
        } else if (end < lines.length) {
            start = end;
            end = Math.min(start + step, lines.length);
            writeLinesStep(fileName, lines, step, start, end, callback);
        } else {
            callback({success: true});
        }
    });
}

function writeLines(fileName, lines) {
    return new Promise((resolve, reject) => {
        if (Array.isArray(lines)) {
            writeLinesStep(fileName, lines, 50, 0, 50, resolve);
        } else {
            fs.writeFile(fileName, lines + '\n', {'flag': 'a'}, err => {
                if (err) {
                    console.error(err);
                    resolve({success: false, err: err});
                } else {
                    resolve({success: true});
                }
            });
        }
    });
}

function readLines(fileName) {
    return new Promise((resolve, reject) => {
        let readStream = fs.createReadStream(fileName);
        let readlineInterface = readline.createInterface({
            input: readStream
        });
        let lines = [];
        readlineInterface.on('line', function (line) {
            lines.push(line);
        });
        readlineInterface.on('close', function () {
            resolve({success: true, lines: lines});
        });
    });
}

function exists(fileName) {
    return new Promise((resolve, reject) => {
        fs.exists(fileName, exists => {
            resolve(exists);
        });
    });
}

function deleteall(path) {
    try {
        if (fs.existsSync(path)) {
            let files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteall(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    } catch (e) {
        console.error(e);
    }
};

function split(fileName, eachNum) {
    return new Promise((resolve, reject) => {
        readLines(fileName, lines => {
            let start = 0;
            let part = 1;
            let len = lines.length;
            while (start < len) {
                let end = Math.min(len, start + eachNum);
                writeLines(fileName + '.' + part, lines.slice(start, end));
                part++;
                start = end;
            }
        });
    });
}

function pollExists(fileName, timeout, interval) {
    return new Promise((resolve, reject) => {
        checkFileExists(fileName, timeout, interval, resolve);
    });
}

function checkFileExists(fileName, timeout, interval, callback) {
    fs.exists(fileName, exists => {
        if (exists) {
            callback(true);
        } else if (new Date().getTime() >= timeout) {
            callback(false);
        } else {
            setTimeout(() => {
                checkFileExists(fileName, timeout, interval, callback);
            }, interval);
        }
    });
}

module.exports = {
    createFile: createFile,
    writeLines: writeLines,
    readLines: readLines,
    exists: exists,
    deleteall: deleteall,
    split: split,
    pollExists: pollExists
}