var httputil = require('./httputil');

class ElasticSearch {

    constructor(hostname, port) {
        this.hostname = hostname;
        this.port = port;
    }

    _get(path, postData) {
        return new Promise((resolve, reject) => {
            httputil.post('http://' + this.hostname + ':' + this.port + path, postData).then(resp => {
                // console.info('response(es): ', resp);
                if (resp.success) {
                    resolve(resp.data);
                } else {
                    reject(resp);
                }
            });
        });
    }

    scroll(path, postData, callback, finalCallback) {
        if (!callback) {
            throw 'esutil.scroll callback undefined';
        }
        this._get(path, postData).then(resData => {
            let jsonData = JSON.parse(resData);
            if (jsonData._scroll_id && jsonData.hits && jsonData.hits.hits.length > 0) {
                for (let hit of jsonData.hits.hits) {
                    try {
                        callback(hit._source);
                    } catch (e) {
                        console.error(e);
                    }
                }
                let postData = `
                    {
                        "scroll": "1m",
                        "scroll_id": "` + jsonData._scroll_id + `"
                    }
                    `;
                this.scroll('/_search/scroll?filter_path=hits,_scroll_id', postData, callback, finalCallback);
            } else if (finalCallback) {
                finalCallback(true);
            }
        }).catch(resp => {
            if (finalCallback) {
                finalCallback(false);
            }
        });
    }
}

module.exports = ElasticSearch;