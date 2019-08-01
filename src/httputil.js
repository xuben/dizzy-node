'use strict';
let http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let {statusCode} = res;
            if (200 != statusCode) {
                // consume response data to release memory
                res.resume();
                resolve({success: false, statusCode: statusCode});
                return;
            }
            let rawData = '';
            res.setEncoding('utf8');
            res.on('data', chunk => {
                rawData += chunk;
            });
            res.on('end', () => {
                resolve({success: true, data: rawData});
            });
        }).on('error', err => {
            console.error('http get error', err);
            resolve({success: false, err: err});
        });
    });
}

function post(url, postData) {
    return new Promise((resolve, reject) => {
        let req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let {statusCode} = res;
            if (200 != statusCode) {
                // consume response data to release memory
                res.resume();
                resolve({success: false, statusCode: statusCode});
                return;
            }
            let rawData = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                resolve({success: true, data: rawData});
            });
        });
        req.write(postData);
        req.end();
    }).on('error', err => {
        console.error('http post error', err);
        resolve({success: false, err: err});
    });
}

function head(url) {
    return new Promise((resolve, reject) => {
        let req = http.request(url, {
            method: 'HEAD'
        }, (res) => {
            let {statusCode} = res;
            // consume response data to release memory
            res.resume();
            resolve({success: 200 == statusCode, statusCode: statusCode});
        }).on('error', err => {
            console.error('http head error', err);
            resolve({success: false, err: err});
        });
        req.end();
    });
}

module.exports = {
    get: get,
    post: post,
    head: head
}