'use strict';

let fileutil = require('./fileutil');

function intersect(fileName1, fileName2) {
    return new Promise((resolve, reject) => {
        let set = new Set();
        let interSet = new Set();
        fileutil.readLines(fileName1).then(result => {
            for (let line of result.lines) {
                set.add(line);
            }
            fileutil.readLines(fileName2).then(result => {
                for (let line of result.lines) {
                    if (set.has(line)) {
                        interSet.add(line);
                    }
                }
                resolve({success: true, data: interSet});
            });
        });
    });
}

function diff(fileName1, fileName2) {
    return new Promise((resolve, reject) => {
        let set = new Set();
        fileutil.readLines(fileName1).then(result => {
            for (let line of result.lines) {
                set.add(line);
            }
            fileutil.readLines(fileName2).then(result => {
                for (let line of result.lines) {
                    set.delete(line);
                }
                resolve({success: true, data: set});
            });
        });
    });
}

module.exports = {
    intersect: intersect,
    diff: diff
}