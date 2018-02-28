const moment = require('moment');
const http = require('http');
const https = require('https');


function getDayTime(){

  return moment().format('YYYY-MM-DD HH:mm:ss');
}

let post = function (options, postData) {

  return new Promise(function (resolve, reject) {
    
      let req = https.request(options, function (res) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
              resolve(chunk);
          });
      });
      req.on('error', function (e) {
          console.log('problem with request: ' + e);
          reject(e);
      });

      req.write(postData);
      req.end();
  });
};

let toQueryString = function(params) {
    let result = '';
    let sortKeys = Object.keys(params).sort();
    for (var i in sortKeys) {
        result += sortKeys[i] + '=' + encodeURIComponent(params[sortKeys[i]]) + '&';
        }
    if (result.length > 0) {
        return result.slice(0, -1);
    } else {
        return result;
        }
    };

let removeKey = function(obj,keys){
    let tmp = {}
    for(let key of keys){
        delete obj[key]
    }
    return obj
}

module.exports = {
  post,
  getDayTime,
  toQueryString,
  removeKey
}
