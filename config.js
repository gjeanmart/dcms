'use strict';
(async () => {

    const fs = require('fs');
	const homedir = require('os').homedir();
    const filename = '.kauri.config.json';
    const configFile = homedir + '/' + filename;

    let Config = { };

    Config.write = function(conf) {
        let data = JSON.stringify(conf);  
        fs.writeFileSync(configFile, data);
    };

    Config.read = function() {
        let data = fs.readFileSync(configFile);
        return JSON.parse(data);
    };

    Config.delete = function() {
        fs.unlinkSync(configFile);
    };

    Config.exists = function() {
        return fs.existsSync(configFile);
    }
    
    module.exports = Config;
})();
