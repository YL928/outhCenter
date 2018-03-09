const router = require('koa-router')();
const LibOuth = require('../lib/alipayOuth');
const Utils = require('../lib/utils');


router.get('/outh/callback', async (ctx, next)=>{
    let retObj = ctx.query
    let auth_code = retObj.auth_code
    let state = retObj.state
    let redirect_url = ctx.session.redirect_url
    if(state == ctx.session.state){
        if (redirect_url.indexOf('?')===-1) {
            url = ctx.session.redirect_url +'?auth_code='+auth_code+'&state='+ctx.session.state
        }else{
            url = ctx.session.redirect_url +'&auth_code='+auth_code+'&state='+ctx.session.state
        };
        if(ctx.session.parmes){
            url = url +'&'+ ctx.session.parmes
        }
        ctx.session = {};
        ctx.redirect(url);
    }else{
        let url = redirect_url +'?code=401&msg=state_not_match'
        ctx.session = {}
        ctx.redirect(url);
    };
});

router.get('/outh/alipay/getcode', async (ctx, next)=>{
    let type = ctx.query.type
    let redirect_url = ctx.query.redirect_url
    let state = ctx.query.state
    let rediect_host = ctx.query.rediect_host
    let rediect_path = ctx.query.rediect_path
    let options = Utils.removeKey(ctx.query, ['type','redirect_url','state']);
    options = Utils.toQueryString(options);
    if(rediect_host && rediect_path){
        redirect_url = rediect_host + '#!/' + rediect_path
        let o = new LibOuth()
        let ret = o.getAuthcodeUrl(type, state)
        ctx.session.state = state
        ctx.session.redirect_url = redirect_url
        ctx.redirect(ret);
    }else if(redirect_url){
        let o = new LibOuth()
        let ret = o.getAuthcodeUrl(type, state);
        ctx.session.state = state
        ctx.session.redirect_url = decodeURIComponent(redirect_url);
        ctx.session.parmes = options;
        ctx.redirect(ret);
    }else{
        ctx.body = JSON.stringify({'code':400,'msg':'非法参数'})
    }
});

router.get('/outh/alipay/gettoken', async (ctx, next)=>{
    let auth_code = ctx.query.app_auth_code
    if(auth_code){
        o = new LibOuth();
        let ret = JSON.parse(await o.getAuthtoken(auth_code));
        ret.code = 200;
        if(ret.error_response){
            ctx.body = JSON.stringify({'code':400,'msg':'非法参数'})
        }
        ctx.type = 'application/json';
        ret = JSON.stringify(ret);     
        ctx.body = ret;
    }else{
        ctx.body = JSON.stringify({'code':400,'msg':'非法参数'})
    }
});

router.get('/outh/alipay/userinfo', async (ctx, next)=>{
    let app_auth_token = ctx.query.app_auth_token
    if(app_auth_token!=null && app_auth_token!=undefined){
        o = new LibOuth();
        let ret = JSON.parse(await o.getUserInfo(app_auth_token));
        ret.code = 200;
        ctx.type = 'application/json';
        ret = JSON.stringify(ret);
        if(ret.error_response){
            ctx.body = JSON.stringify({'code':400,'msg':'非法参数'})
        }      
        ctx.body = ret;
    }else{
        ctx.body = JSON.stringify({'code':400,'msg':'非法参数'});
    }
});


module.exports = router