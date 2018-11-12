#!/usr/bin/env node

'use strict';

const program 	= require('caporal');
const Kauri 	= require('../index');
const config 	= require('../config.js');
const fs 		= require("fs");
const path 		= require("path");
const mime 		= require('mime');
const fileExtension = require('file-extension');

program
    .version('0.0.1')
    .description('Kauri');

program
  	.command('init')
    .description('Initialise a registry or connect to an existing one.')
  	.option('-e, --ethereum <ethereum>', 'Ethereum node endpoint', null, 'http://localhost:8545', false)
    .option('-i, --ipfs <ipfs>', 'IPFS node endpoint', null, 'http://localhost:5001', false)
    .option('-r, --registry <registry>', 'Registry ("new" or contract address) to connect to', null, 'new', false)
    .option('-m, --mnemonic <mnemonic>', 'Mnemonic', null, null, false)
    .option('-i, --index <index>', 'Mnemonic', program.INT, null, false)
  	.action(async function (args, options, logger) {

        try {
        	let conf = {
        		'connections': {
        			'ethereum': options.ethereum, 
        			'ipfs': options.ipfs
        		}, 
        		'registry': options.registry,
        		'mnemonic': options.mnemonic,
        		'index': options.index
        	};

            let res = await Kauri.init(conf);

            conf.registry = res.registry.instance.address;

            config.write(conf);

            logger.info('Registry deployed to ' + conf.registry + '');

        } catch(err) {
            logger.error('ERROR: init(args: '+JSON.stringify(args)+', options: '+JSON.stringify(options)+') >>> ' + err);
        }
  	});


////////////////////////////////////////////////////////////////////////////
// SPACE [REMOTE]

program
  	.command('content new')
    .description('Create a new empty space in the registry')
    .argument('<space>', 'Space name')
  	.option('-o, --owner [owner]', 'Owner of the space (Ethereum address)')
  	.action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            let kauri = await Kauri.init(config.read());
            let res = await kauri.createSpace(args.space, options.owner);

            logger.info('Content ' + res.id + ' created (owner: ' + res.owner + ')');

        } catch(err) {
            logger.error('Error while creating the content ' + args.space + ' >>> ' + err);
        }
  	});

program
    .command('content push')
    .description('Push a revision')
    .argument('<space>', 'Space')
    .argument('<revision>', 'Revision')
    .action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            let kauri = await Kauri.init(config.read());
            let res = await kauri.pushRevision(args.space, args.revision);

            logger.info(res);

        } catch(err) {
            logger.error('Error Pushing the revision ' + args.revision + ' to space ' + args.space + ' >>> ' + err);
        }
    });

 program
    .command('content all')
    .description('Get all spaces')
    .action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            let kauri = await Kauri.init(config.read());
            let res = await kauri.getAllSpaces();

            logger.info(res.map(r => { return {
            	'space': r.id,
            	'owner': r.owner,
            	'lastRevision': r.lastRevision
            }}));

        } catch(err) {
            logger.error('Error adding file ' + args.file + ' >>> ' + err);
        }
    });

program
  	.command('content info')
  	.description('Get info about a space')
    .argument('<space>', 'Space')
  	.option('-e, --ethereum [ethereum]', 'Ethereum node endpoint', null, 'http://localhost:8545')
  	.action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            let kauri = await Kauri.init(config.read());
            let res = await kauri.getSpace(args.space);

            logger.info({
            	'space': args.space,
            	'owner': res.owner,
            	'lastRevision': res.lastRevision,
            	'revisions': res.revisions
            });

        } catch(err) {
            logger.error('Error while getting content info for ' + args.space + ' >>> ' + err);
        }
  	});


////////////////////////////////////////////////////////////////////////////
// REVISION [LOCAL]

program
    .command('revision create')
    .description('Create a local revision')
    .argument('<space>', 'Space')
    .argument('<file>', 'File')
    .option('-p, --parent [parent]', 'Parent revision', program.REPEATABLE, null, false)
    .option('-a, --attributes [keyValue]', 'Metadata attributes ', program.REPEATABLE, null, false) // should be REPEATABLE + regex ('/^[a-z]{3,20}=.+/i') validator
    .action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            let kauri = await Kauri.init(config.read());

            // Content
            let data = fs.readFileSync(args.file);

            // metadata/attributes
            let attributes = parseKeyValue(options.attributes) || {};
            attributes.title = attributes.title || path.basename(args.file);
			attributes.mimetype = attributes.mimetype || mime.getType(fileExtension(path.basename(args.file)));

            let res = await kauri.createRevision(args.space, new Buffer(data), attributes, options.parent);

            logger.info('Revision ' + res + ' created');

        } catch(err) {
            logger.error('Error adding file ' + args.file + ' >>> ' + err);
        }
    });

 program
    .command('revision view')
    .description('Get revision')
    .argument('<space>', 'Space')
    .argument('<revision>', 'Revision hash')
    .action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            let kauri = await Kauri.init(config.read());
            let res = await kauri.getRevision(args.space, args.revision);

            logger.info({
            	'space': args.space,
            	'revisionHash': args.revision,
            	'parentHash': res.parent,
            	'author': res.author,
            	'content': res.content.toString(),
            	'metadata': res.metadata
            });

        } catch(err) {
            logger.error('Error adding file ' + args.file + ' >>> ' + err);
        }
    });


////////////////////////////////////////////////////////////////////////////
// CONFIG

program
  	.command('config show')
    .description('Show configuration')
  	.action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

        	logger.info("Configuration: ")
            logger.info(config.read());

        } catch(err) {
            logger.error('Error: ' + err);
        }
  	});
  	
program
  	.command('config delete')
    .description('Delete configuration')
  	.action(async function (args, options, logger) {

        try {

        	if(!config.exists()) {
        		throw "Please configure a registry by using the command 'kauri init'";
        	}

            config.delete();
        	logger.info("Configuration deleted");

        } catch(err) {
            logger.error('Error: ' + err);
        }
  	});

program.parse(process.argv);

function parseKeyValue(keyValues) {
	if(!keyValues) return;

	var result = {};

	if(keyValues instanceof Array) {
		keyValues.forEach(function(x){
		    var keyVal = splitKeyValue(x);
		    result[keyVal.key] = keyVal.value;
		});

	} else if (keyValues instanceof String) {
		var keyVal = splitKeyValue(keyValues);
		result[keyVal.key] = keyVal.value;
	}


	return result;
}

function splitKeyValue(keyVal) {
	var arr = keyVal.split('=');
	return {
		'key': arr[0],
		'value': arr[1]
	}
}