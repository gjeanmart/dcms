'use strict';
(async () => {

    const fs = require('fs');
	const homedir = require('os').homedir();
    const filename = '.kauri.db.json';
    const configFile = homedir + '/' + filename;

    let DB = { };

    DB.addRevision = function(space, hash) {
        let db = Config.read();
        (db['local'][space] || []).push(hash);
        Config.write(db);
    };

    DB.removeRevision = function(space, hash) {
        let db = Config.read();
        var index = (db['local'][space] || []).indexOf('seven');
        if (index > -1) {
           (db['local'][space] || []).splice(index, 1);
        }
        Config.write(db);
    };

    DB.write = function(db) {
        let data = JSON.stringify(conf);  
        fs.writeFileSync(configFile, data);
    };

    DB.read = function() {
        let data = fs.readFileSync(configFile);
        return JSON.parse(data);
    };

    DB.delete = function() {
        fs.unlinkSync(configFile);
    };

    DB.exists = function() {
        return fs.existsSync(configFile);
    }
    
    module.exports = DB;
})();
