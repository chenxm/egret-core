/// <reference path="../../lib/types.d.ts" />
var url = require('url');
var file = require('../../lib/FileUtil');
var DoCreate = require('../../commands/DoCreateCommand');
var exportObject = {
    LarkStaticContentPath: '$/content/',
    UserProjectPath: null,
    install: install
};
var self = this;
function install() {
    addRoute('$/ping/', ping);
    addRoute('$/help/', help);
    addRoute('$/create/', create);
    addRoute('$/shutdown', shutdown);
    framework.file('Lark manage static files', staticFiles);
    framework.file('User project static files', projectFiles);
}
function addRoute(path, method) {
    framework.route(path, function () {
        self = this;
        var viewdata = {
            options: egret.server.options.toJSON(),
            manifest: egret.manifest,
            IPs: egret.server.IPs
        };
        this.repository = viewdata;
        method.call(this);
    });
}
function create() {
    if (this.req.query['proj'])
        return doCreate();
    if (this.req.query['cancel'])
        return cancelCreate();
    this.view('create');
}
function doCreate() {
    var projJSON = self.req.query['proj'];
    try {
        var proj = JSON.parse(projJSON);
        var create = new DoCreate();
        create.project = proj;
        create.execute();
        self.res.send(200, 'OK');
        setTimeout(function () { return process.exit(0); }, 1000);
    }
    catch (e) {
        console.log(e);
        self.res.send(500, JSON.stringify(e, null, '  '));
    }
}
function cancelCreate() {
    self.res.send(200, 'OK');
    setTimeout(function () { return process.exit(0); }, 200);
}
function help() {
    this.view('help');
}
function shutdown() {
    console.log('The server has been shutdown');
    self.res.send(200, '');
    setTimeout(function () { return process.exit(0); }, 200);
}
function ping() {
    console.log('call ping');
    var res = self.res;
    res.send(200, 'OK');
}
function staticFiles(req, res, isValidation) {
    if (isValidation) {
        return req.url.indexOf(exportObject.LarkStaticContentPath) !== -1;
    }
    var filePath = getLarkContentFullName(req);
    framework.responseFile(req, res, filePath);
}
function projectFiles(req, res, isValidation) {
    if (isValidation) {
        if (req.url.indexOf('$/') >= 0)
            return false;
        var path = getUserProjectContentFullName(req);
        return file.exists(path);
    }
    var path = getUserProjectContentFullName(req);
    framework.responseFile(req, res, path);
}
function getLarkContentFullName(req) {
    var url = req.url;
    var path = url.replace(exportObject.LarkStaticContentPath, '');
    var fullpath = utils.combine('~', __dirname, '../content/', path);
    return fullpath;
}
function getUserProjectContentFullName(req) {
    var uri = url.parse(req.url);
    var fullpath = utils.combine('~', exportObject.UserProjectPath, uri.pathname);
    return fullpath;
}
module.exports = exportObject;
