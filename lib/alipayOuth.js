const fs = require('fs')
const crypto = require('crypto');
const OuthConfig = require('./outhConfig');
const utils = require('./utils');
const util = require('util');

class Outh {
    // Filter 参数
    paramsFilter (params) {
    let result = {};
    if (!params) {
        return result;
        }
    for (var k in params) {
        if (!params[k] || params[k] === '' || k === 'sign') {
            continue;
            }
        result[k] = params[k];
        }
    return result;
    };

    // 将参数排序，并返回字符串
    toQueryString (params) {
    let result = '';
    let sortKeys = Object.keys(params).sort();
    for (var i in sortKeys) {
        result += sortKeys[i] + '=' + params[sortKeys[i]] + '&';
        }
    if (result.length > 0) {
        return result.slice(0, -1);
    } else {
        return result;
        }
    };

    // 生成吊起授权
    getAuthcodeUrl (type, now) {
        let scope = ''
        switch (type) {
            case 'base':
                console.log('scope auth_base')
                scope = 'auth_base';
                break;
            
            case 'info':
                console.log('scope auth_user')
                scope = 'auth_user';
                break;

            default:
                scope = 'auth_base';
                break;
        }
        let redirect_uri = encodeURI(OuthConfig.outhBackUrl);
        let base = "https://openauth.alipaydev.com/oauth2/publicAppAuthorize.htm?app_id=%s&scope=%s&redirect_uri=%s&state=%s"
        let ridUrl = util.format(base, OuthConfig.app_id, scope, redirect_uri, now+'');
        return ridUrl;
    };

    getSign(params){
      let Sign = crypto.createSign('RSA-SHA256');
      Sign.update(params);
      let pKey = '-----BEGIN RSA PRIVATE KEY-----\n' + OuthConfig.privateKey + '\n-----END RSA PRIVATE KEY-----'
      return Sign.sign(pKey, 'base64')
    }

    getAuthtoken(auth_code) {
        let paramsObj={
            'app_id': OuthConfig.app_id,
            'method': 'alipay.system.oauth.token',
            'format': 'JSON',
            'charset': 'GBK',
            'sign_type': 'RSA2',
            'sign': '',
            'timestamp': utils.getDayTime(),
            'version': '1.0',
            'grant_type': 'authorization_code',
            'code': auth_code,
        };
        let params = this.paramsFilter(paramsObj);
        params = this.toQueryString(params);
        paramsObj.sign = this.getSign(params);
        let postData = require('querystring').stringify(paramsObj)
        let options = {
            method: 'POST',
            host: OuthConfig.gateway,
            path: OuthConfig.gatewayPath,
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded; charset=utf-8',
                "Content-Length": postData.length,
            }
        };
        return utils.post(options, postData);
    }

    getUserInfo(auth_token){
        let paramsObj={
            'app_id': OuthConfig.app_id,
            'method': 'alipay.user.info.share',
            'format': 'JSON',
            'charset': 'GBK',
            'sign_type': 'RSA2',
            'sign': '',
            'timestamp': utils.getDayTime(),
            'version': '1.0',
            'grant_type': 'authorization_code',
            'auth_token': auth_token,
        };
        
        let params = this.paramsFilter(paramsObj);
        params = this.toQueryString(params);
        paramsObj.sign = this.getSign(params);
        let postData = require('querystring').stringify(paramsObj);
        let options = {
            method: 'POST',
            host: OuthConfig.gateway,
            path: OuthConfig.gatewayPath,
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded; charset=utf-8',
                "Content-Length": postData.length,
            }
        };
        return utils.post(options, postData);
    
    }

}
module.exports = Outh;
