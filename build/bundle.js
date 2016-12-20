module.exports=function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";var r=n(16),o=n(2),a=n(17),i=n(1),u=n(4),s=n(20);o.urlHelpers.getBaseUrl=function(e){var t=r.parse(e.originalUrl||"").pathname||"";return r.format({protocol:"https",host:e.headers.host,pathname:t.replace(e.path,"").replace(/\/$/g,"")})};var c=o.createServer(function(e,t){return u.info("Starting Slack MFA Extension - Version:","1.0.1"),a(e,t)});e.exports=function(e,t,n){i.setValue("PUBLIC_WT_URL",s.getUrl(t)),c(e,t,n)}},function(e,t){"use strict";var n={},r=null,o=function(e){if(n&&n[e])return n[e];if(!r)throw new Error("A configuration provider has not been set");return r(e)};o.setProvider=function(e){r=e},o.setValue=function(e,t){n[e]=t},e.exports=o},function(e,t){e.exports=require("auth0-extension-express-tools@1.0.1")},function(e,t){e.exports=require("express")},function(e,t,n){"use strict";var r=n(60);r.emitErrs=!0;var o=new r.Logger({transports:[new r.transports.Console({timestamp:!0,level:"debug",handleExceptions:!0,json:!1,colorize:!0})],exitOnError:!1});e.exports=o,e.exports.stream={write:function(e){o.info(e.replace(/\n$/,""))}}},function(e,t,n){e.exports=!n(6)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t){var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){e.exports=require("path")},function(e,t){var n=e.exports={version:"2.4.0"};"number"==typeof __e&&(__e=n)},function(e,t){e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},function(e,t,n){var r=n(31);e.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==r(e)?e.split(""):Object(e)}},function(e,t){var n=Math.ceil,r=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(e>0?r:n)(e)}},function(e,t,n){var r=n(12),o=n(11);e.exports=function(e){return r(o(e))}},function(e,t){e.exports=require("ejs")},function(e,t){e.exports=require("url")},function(e,t,n){(function(t){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}var o=n(9),a=r(o),i=n(59),u=r(i),s=n(3),c=r(s),l=n(56),f=r(l),d=n(2),p=n(4),h=r(p),x=n(1),m=r(x),v=n(21),_=r(v),g=n(24),b=r(g),y=n(22),k=r(y),w=n(23),T=r(w);e.exports=function(e){m.default.setProvider(e);var n=new c.default;return n.use((0,u.default)(":method :url :status :response-time ms - :res[content-length]",{stream:h.default.stream})),n.use(f.default.json()),n.use(f.default.urlencoded({extended:!1})),n.use(d.routes.dashboardAdmins({stateKey:"box-platform-state",secret:(0,m.default)("EXTENSION_SECRET"),audience:"urn:box-platform",rta:(0,m.default)("AUTH0_RTA").replace("https://",""),domain:(0,m.default)("AUTH0_DOMAIN"),baseUrl:(0,m.default)("PUBLIC_WT_URL"),clientName:"Box Platform Extension",urlPrefix:"/admins",sessionStorageKey:"box-platform:apiToken",scopes:"read:clients read:resource_servers"})),n.use("/api",(0,_.default)()),n.use("/app",c.default.static(a.default.join(t,"../dist"))),n.use("/meta",(0,b.default)()),n.use("/.extensions",(0,k.default)()),n.get("*",(0,T.default)()),n.use(d.middlewares.errorHandler(h.default.error)),n}}).call(t,"/")},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(15),a=r(o),i=n(1),u=r(i),s=n(19),c=r(s);t.default=function(){return a.default.render(c.default,{extensionUrl:(0,u.default)("PUBLIC_WT_URL").replace(/\/$/g,""),apiKey:(0,u.default)("EXTENSION_SECRET"),updateTime:function(){return(new Date).toISOString()},SLACK_API_TOKEN:(0,u.default)("SLACK_API_TOKEN"),SIGINING_SECRET:cofnig("SIGNING_SECRET"),MONGO_CONNECTION_STRINGT:(0,u.default)("MONGO_CONNECTION_STRING")})}},function(e,t){"use strict";e.exports="/*\n*  This rule been automatically generated by the auth0-slack-mfa extension on <%= updateTime() %>\n*/\nfunction (user, context, callback) {\n  var jwt = require('jsonwebtoken');\n  var MongoClient = require('mongodb');\n  var CLIENTS_WITH_MFA = ['ZxbatHjRgBj9xFZ1SyygKZDhkb4r17Vk'];\n\n  // run only for the specified clients\n  if (CLIENTS_WITH_MFA.indexOf(context.clientID) === -1) {\n    return callback(null,user,context);\n  }\n\n  // returning from MFA validation\n  if(context.protocol === 'redirect-callback') {\n    var decoded = jwt.verify(context.request.query.token, new Buffer(configuration.slack_mfa_secret, 'base64'));\n    if (!decoded || decoded.iss !== 'urn:sgmeyer:slack:mfacallback') return callback(new Error('Invalid Token'));\n\n    MongoClient = require('mongodb').MongoClient;\n    MongoClient.connect(configuration.mongo_connection, function(err, db) {\n      var collection = db.collection('Token');\n\n      var filter = { \"jti\": decoded.jti };\n      collection.findOne(filter, function (err, whitelist) {\n        if (!whitelist) return callback(new Error('Invalid JWT ID'));\n\n        collection.remove(filter, function (err) {\n          if (err) throw new Error('Failed to revoke token');\n          return callback(null,user,context);\n        });\n      });\n    });\n\n    return callback(null,user,context);\n  } else {\n\n    var uuid = require('uuid');\n    var token_payload = {\n      sub: user.user_id,\n      aud: context.clientID,\n      jti: uuid.v4(),\n      iat: new Date().getTime() / 1000,\n      iss: 'urn:sgmeyer:slack:mfa'\n    };\n\n    if (user.user_metadata) {\n      token_payload.slack_username = user.user_metadata.slack_mfa_username;\n      token_payload.slack_enrolled = user.user_metadata.slack_mfa_enrolled;\n    }\n\n    var token = jwt.sign(token_payload,\n      new Buffer(configuration.slack_mfa_secret, 'base64'),\n      {\n        subject: user.user_id,\n        expiresInMinutes: 5,\n        audience: context.clientID,\n        issuer: 'urn:sgmeyer:slack:mfa',\n        iat: new Date().getTime() / 1000\n      });\n\n    MongoClient = require('mongodb').MongoClient;\n    MongoClient.connect(configuration.mongo_connection, function (err, db) {\n      var tokenRecord = {\n        jti: token_payload.jti,\n        sub: token_payload.sub,\n        iss: token_payload.iss,\n        issued: new Date(token_payload.iat * 1000)\n      };\n\n      var upsertFilter = { 'sub': token_payload.sub, 'iss': token_payload.iss };\n      return db.collection('Token').update(upsertFilter, tokenRecord, { upsert: true }, function (err, record) {\n        if (err) { throw new Error('Failed to whitelist JWT.'); }\n\n      var route = user.user_metadata && user.user_metadata.slack_mfa_username ? \"/mfa\" : \"/enroll\";\n        context.redirect = { url: configuration.slack_mfa_url + route + '?token=' + token };\n        return callback(null, user, context);\n      });\n    });\n  }\n}"},function(e,t,n){"use strict";function r(e){if(!e.container)return null;var t=e.container.replace(s,"\\$&"),n=e.jtn?e.jtn.replace(s,"\\$&"):"";if(e.url_format===u)return new RegExp("^/api/run/"+t+"/(?:"+n+"/?)?");if(e.url_format===i)return new RegExp("^/"+t+"/(?:"+n+"/?)?");if(e.url_format===a)return new RegExp("^/(?:"+n+"/?)?");throw new Error("Unsupported webtask URL format.")}var o=n(16),a=3,i=2,u=1,s=/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;e.exports.getUrl=function(e){var t=r(e.x_wt),n=e.url,a=e.url.replace(t,"/"),i=o.parse(a||"").pathname,u=o.parse(n||"").pathname||"",s=o.format({protocol:"https",host:e.headers.host,pathname:u.replace(i,"").replace(/\/$/g,"")});return e.x_wt&&(0===s.indexOf("https://sandbox.it.auth0.com")?s=s.replace("https://sandbox.it.auth0.com/api/run/"+e.x_wt.container+"/","https://"+e.x_wt.container+".us.webtask.io/"):0===s.indexOf("https://sandbox-eu.it.auth0.com")?s=s.replace("https://sandbox-eu.it.auth0.com/api/run/"+e.x_wt.container+"/","https://"+e.x_wt.container+".eu.webtask.io/"):0===s.indexOf("https://sandbox-au.it.auth0.com")&&(s=s.replace("https://sandbox-au.it.auth0.com/api/run/"+e.x_wt.container+"/","https://"+e.x_wt.container+".au.webtask.io/"))),s}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(9),a=(r(o),n(55)),i=(r(a),n(3));t.default=function(){var e=(0,i.Router)();return e}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(26),a=r(o),i=n(58),u=r(i),s=n(3),c=n(2),l=n(1),f=r(l),d=n(4),p=r(d),h=n(18),x=r(h);t.default=function(){var e=(0,s.Router)(),t=c.middlewares.validateHookToken((0,f.default)("AUTH0_DOMAIN"),(0,f.default)("WT_URL"),(0,f.default)("EXTENSION_SECRET"));return e.use("/on-install",t("/.extensions/on-install")),e.use("/on-uninstall",t("/.extensions/on-uninstall")),e.use(c.middlewares.managementApiClient({domain:(0,f.default)("AUTH0_DOMAIN"),clientId:(0,f.default)("AUTH0_CLIENT_ID"),clientSecret:(0,f.default)("AUTH0_CLIENT_SECRET")})),e.post("/on-install",function(e,t){var n="auth0-slack-mfa";e.auth0.rules.getAll().then(function(t){var r={name:n,script:(0,x.default)(f.default,n)},o=u.default.find(t,{name:n});return o?e.auth0.rules.update({id:o.id},r):e.auth0.rules.create((0,a.default)({stage:"login_success"},r))}).then(function(){p.default.debug("Slack MFA rule deployed."),t.sendStatus(204)}).catch(function(e){p.default.debug("Error deploying Slack MFA rule."),p.default.error(e),t.sendStatus(400)})}),e.delete("/on-uninstall",function(e,t){e.auth0.rules.getAll().then(function(t){var n=u.default.find(t,{name:ruleName});n&&e.auth0.rules.delete({id:n.id})}).then(function(){p.default.debug("Slack MFA rule deleted."),t.sendStatus(204)}).catch(function(e){p.default.debug("Error deleting Slack MFA rule."),p.default.error(e),t.sendStatus(204)})}),e}},function(e,t,n){(function(e){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(57),a=r(o),i=n(15),u=r(i),s=n(9),c=r(s),l=n(2),f=n(1),d=r(f);t.default=function(){var t='\n  <!DOCTYPE html>\n  <html lang="en">\n  <head>\n    <title>Auth0 - Box Platform</title>\n    <meta charset="UTF-8" />\n    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/4.6.13/lib/logos/img/favicon.png">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styles/zocial.min.css">\n    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.1715/css/index.min.css">\n    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/4.6.13/index.css">\n    <% if (assets.style) { %><link rel="stylesheet" type="text/css" href="/app/<%= assets.style %>"><% } %>\n    <% if (assets.version) { %><link rel="stylesheet" type="text/css" href="//cdn.auth0.com/extensions/auth0-box-platform/assets/auth0-box-platform.ui.<%= assets.version %>.css"><% } %>\n    <style type="text/css">\n    pre {\n      background-color: #fbfbfb;\n      border: 1px solid #f1f1f1;\n      border-radius: 0px;\n      padding: 10px 10px;\n      font-size: 12px;\n    }\n    </style>\n  </head>\n  <body class="a0-extension">\n    <div id="app"></div>\n    <script type="text/javascript" src="//cdn.auth0.com/js/lock-9.0.min.js"></script>\n    <script type="text/javascript" src="//cdn.auth0.com/manage/v0.3.1715/js/bundle.js"></script>\n    <script type="text/javascript">window.config = <%- JSON.stringify(config) %>;</script>\n    <% if (assets.vendors) { %><script type="text/javascript" src="/app/<%= assets.vendors %>"></script><% } %>\n    <% if (assets.app) { %><script type="text/javascript" src="//localhost:3000/app/<%= assets.app %>"></script><% } %>\n    <% if (assets.version) { %>\n    <script type="text/javascript" src="//cdn.auth0.com/extensions/auth0-box-platform/assets/auth0-box-platform.ui.vendors.<%= assets.version %>.js"></script>\n    <script type="text/javascript" src="//cdn.auth0.com/extensions/auth0-box-platform/assets/auth0-box-platform.ui.<%= assets.version %>.js"></script>\n    <% } %>\n  </body>\n  </html>\n  ';return function(n,r){var o={BASE_URL:l.urlHelpers.getBaseUrl(n),BASE_PATH:l.urlHelpers.getBasePath(n),AUTH0_DOMAIN:(0,d.default)("AUTH0_DOMAIN"),AUTH0_MANAGE_URL:(0,d.default)("AUTH0_MANAGE_URL")||"http://manage.auth0.com"},i="1.0.1";return i?r.send(u.default.render(t,{config:o,assets:{version:i}})):a.default.readFile(c.default.join(e,"../../dist/manifest.json"),"utf8",function(e,n){var a={config:o,assets:{app:"bundle.js"}};!e&&n&&(a.assets=JSON.parse(n)),r.send(u.default.render(t,a))})}}}).call(t,"/")},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(3),a=r(o),i=n(54),u=r(i);t.default=function(){var e=a.default.Router();return e.get("/",function(e,t){t.status(200).send(u.default)}),e}},function(e,t,n){e.exports={default:n(27),__esModule:!0}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var o=n(25),a=r(o);t.default=a.default||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}},function(e,t,n){n(53),e.exports=n(10).Object.assign},function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},function(e,t,n){var r=n(8);e.exports=function(e){if(!r(e))throw TypeError(e+" is not an object!");return e}},function(e,t,n){var r=n(14),o=n(49),a=n(48);e.exports=function(e){return function(t,n,i){var u,s=r(t),c=o(s.length),l=a(i,c);if(e&&n!=n){for(;c>l;)if(u=s[l++],u!=u)return!0}else for(;c>l;l++)if((e||l in s)&&s[l]===n)return e||l||0;return!e&&-1}}},function(e,t){var n={}.toString;e.exports=function(e){return n.call(e).slice(8,-1)}},function(e,t,n){var r=n(28);e.exports=function(e,t,n){if(r(e),void 0===t)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}}},function(e,t,n){var r=n(8),o=n(7).document,a=r(o)&&r(o.createElement);e.exports=function(e){return a?o.createElement(e):{}}},function(e,t){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(e,t,n){var r=n(7),o=n(10),a=n(32),i=n(37),u="prototype",s=function(e,t,n){var c,l,f,d=e&s.F,p=e&s.G,h=e&s.S,x=e&s.P,m=e&s.B,v=e&s.W,_=p?o:o[t]||(o[t]={}),g=_[u],b=p?r:h?r[t]:(r[t]||{})[u];p&&(n=t);for(c in n)l=!d&&b&&void 0!==b[c],l&&c in _||(f=l?b[c]:n[c],_[c]=p&&"function"!=typeof b[c]?n[c]:m&&l?a(f,r):v&&b[c]==f?function(e){var t=function(t,n,r){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(t);case 2:return new e(t,n)}return new e(t,n,r)}return e.apply(this,arguments)};return t[u]=e[u],t}(f):x&&"function"==typeof f?a(Function.call,f):f,x&&((_.virtual||(_.virtual={}))[c]=f,e&s.R&&g&&!g[c]&&i(g,c,f)))};s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,e.exports=s},function(e,t){var n={}.hasOwnProperty;e.exports=function(e,t){return n.call(e,t)}},function(e,t,n){var r=n(40),o=n(45);e.exports=n(5)?function(e,t,n){return r.f(e,t,o(1,n))}:function(e,t,n){return e[t]=n,e}},function(e,t,n){e.exports=!n(5)&&!n(6)(function(){return 7!=Object.defineProperty(n(33)("div"),"a",{get:function(){return 7}}).a})},function(e,t,n){"use strict";var r=n(43),o=n(41),a=n(44),i=n(50),u=n(12),s=Object.assign;e.exports=!s||n(6)(function(){var e={},t={},n=Symbol(),r="abcdefghijklmnopqrst";return e[n]=7,r.split("").forEach(function(e){t[e]=e}),7!=s({},e)[n]||Object.keys(s({},t)).join("")!=r})?function(e,t){for(var n=i(e),s=arguments.length,c=1,l=o.f,f=a.f;s>c;)for(var d,p=u(arguments[c++]),h=l?r(p).concat(l(p)):r(p),x=h.length,m=0;x>m;)f.call(p,d=h[m++])&&(n[d]=p[d]);return n}:s},function(e,t,n){var r=n(29),o=n(38),a=n(51),i=Object.defineProperty;t.f=n(5)?Object.defineProperty:function(e,t,n){if(r(e),t=a(t,!0),r(n),o)try{return i(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(e[t]=n.value),e}},function(e,t){t.f=Object.getOwnPropertySymbols},function(e,t,n){var r=n(36),o=n(14),a=n(30)(!1),i=n(46)("IE_PROTO");e.exports=function(e,t){var n,u=o(e),s=0,c=[];for(n in u)n!=i&&r(u,n)&&c.push(n);for(;t.length>s;)r(u,n=t[s++])&&(~a(c,n)||c.push(n));return c}},function(e,t,n){var r=n(42),o=n(34);e.exports=Object.keys||function(e){return r(e,o)}},function(e,t){t.f={}.propertyIsEnumerable},function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},function(e,t,n){var r=n(47)("keys"),o=n(52);e.exports=function(e){return r[e]||(r[e]=o(e))}},function(e,t,n){var r=n(7),o="__core-js_shared__",a=r[o]||(r[o]={});e.exports=function(e){return a[e]||(a[e]={})}},function(e,t,n){var r=n(13),o=Math.max,a=Math.min;e.exports=function(e,t){return e=r(e),e<0?o(e+t,0):a(e,t)}},function(e,t,n){var r=n(13),o=Math.min;e.exports=function(e){return e>0?o(r(e),9007199254740991):0}},function(e,t,n){var r=n(11);e.exports=function(e){return Object(r(e))}},function(e,t,n){var r=n(8);e.exports=function(e,t){if(!r(e))return e;var n,o;if(t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;if("function"==typeof(n=e.valueOf)&&!r(o=n.call(e)))return o;if(!t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;throw TypeError("Can't convert object to primitive value")}},function(e,t){var n=0,r=Math.random();e.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++n+r).toString(36))}},function(e,t,n){var r=n(35);r(r.S+r.F,"Object",{assign:n(39)})},function(e,t){e.exports={title:"Slack MFA",name:"auth0-slack-mfa",version:"0.0.1",author:"auth0",description:"This extension gives the ability to add multifactor authentication using Slack.",type:"application",useHashName:!1,initialUrlPath:"/admins/login",uninstallConfirmMessage:"Do you really want to uninstall this extension?",repository:"https://github.com/auth0-extensions/auth0-slack-mfa",keywords:["auth0","extension","slack","mfa"],auth0:{createClient:!0,onInstallPath:"/.extensions/on-install",onUninstallPath:"/.extensions/on-uninstall",scopes:"read:clients delete:clients read:rules create:rules update:rules delete:rules"},secrets:{SLACK_API_TOKEN:{example:"Slack API Token",description:"Your Slack API token.",required:!0},MONGO_CONNECTION_STRING:{example:"Slack API Token",description:"Your MongoDB connection string.",required:!0},SIGNING_SECRET:{example:"",description:"The secret used to sign the JWT's used by this extension.",required:!0,type:"password"}}}},function(e,t){e.exports=require("bluebird")},function(e,t){e.exports=require("body-parser")},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("lodash@3.10.1")},function(e,t){e.exports=require("morgan")},function(e,t){e.exports=require("winston")}]);