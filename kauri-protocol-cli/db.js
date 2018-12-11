'use strict';
(async () => {

    const fs = require('fs');
    const homedir = require('os').homedir();
    const filename = '.kauri.db.json';
    const configFile = homedir + '/' + filename;

    let DB = { };

    DB.addRevision = function(space, hash) {
        let db = DB.read();
        if(!db.local[space]) {
            db.local[space] = [];
        }
        if(!db.local[space].includes(hash)) {
            db.local[space].push(hash);
        }
        DB.write(db);
    };

    DB.removeRevision = function(space, hash) {
        let db = DB.read();

       if(!db.local[space]) {
            db.local[space] = [];
        }

        var index = db.local[space].indexOf(hash);
        if (index > -1) {
           db.local[space].splice(index, 1);
        }
        DB.write(db);
    };

    DB.getRevisions = function(space, hash) {
        let db = DB.read();

       if(!db.local[space]) {
            return [];
        }

        return db.local[space];
    };

    DB.write = function(db) {
        let data = JSON.stringify(db);  
        fs.writeFileSync(configFile, data);
    };

    DB.read = function() {
        if (!fs.existsSync(configFile)) {
            return {"local": {}};
        }
        let data = fs.readFileSync(configFile);
        return JSON.parse(data);
    };

    DB.delete = function() {
        if (fs.existsSync(configFile)) {
            fs.unlinkSync(configFile);
        }
    };

    DB.exists = function() {
        return fs.existsSync(configFile);
    }
    
    module.exports = DB;
})();
