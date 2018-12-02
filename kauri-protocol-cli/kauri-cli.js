#!/usr/bin/env node

'use strict';

const program 	       = require('caporal');
const Kauri 	       = require('kauri-protocol');
const config 	       = require('./config.js');
const db 		       = require('./db.js');
const fs 		       = require("fs");
const path 		       = require("path");
const mime 		       = require('mime');
const fileExtension    = require('file-extension');

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
    .option('-x, --index <index>', 'Mnemonic', program.INT, null, false)
  	.action(async function (args, options, logger) {

        try {

            const conf = {
                'connections': {
                    'ethereum': options.ethereum, 
                    'ipfs': options.ipfs
                }, 
                'registry': options.registry, 
                'mnemonic': options.mnemonic, 
                'index': options.index
            };

            let res = await Kauri.init(config.load(conf));
            conf.registry = res.registry.instance.address;

            config.write(conf);
            db.delete();

            logger.info('Connected to registry [address: ' + conf.registry + ']');

        } catch(err) {
            logger.error('ERROR: init(args: '+JSON.stringify(args)+', options: '+JSON.stringify(options)+') >>> ' + err);
        }
  	});


////////////////////////////////////////////////////////////////////////////
// SPACE [REMOTE]

program
  	.command('space create')
    .description('Create a new empty space in the registry')
    .argument('<space>', 'Space name')
  	.option('-o, --owner [owner]', 'Owner of the space (Ethereum address)')
  	.action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());
            let res = await kauri.createSpace(args.space, options.owner);

            logger.info('Content ' + res.id + ' created (owner: ' + res.owner + ')');

        } catch(err) {
            logger.error('Error while creating the content ' + args.space + ' >>> ' + err);
        }
  	});

program
    .command('space push')
    .description('Push a specific revision in a space')
    .argument('<space>', 'Space name')
    .argument('<revision>', 'Revision hash or "all"')
    .action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());

            if(args.revision == 'all') {
            	db.getRevisions(args.space).map(async function(r) { 
            		console.log("r="+r)
            		await kauri.pushRevision(args.space, r); 
            		db.removeRevision(args.space, r);
            	});
            } else {
            	let res = await kauri.pushRevision(args.space, args.revision);
            	db.removeRevision(args.space, args.revision);
            }

            logger.info("revision(s) pushed");

        } catch(err) {
            logger.error('Error Pushing the revision ' + args.revision + ' to space ' + args.space + ' >>> ' + err);
        }
    });

 program
    .command('space all')
    .description('Get all spaces')
    .action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());
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
  	.command('space info')
  	.description('Get info about a space')
    .argument('<space>', 'Space name')
  	.action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());
            let space = await kauri.getSpace(args.space);
            let revisions = await kauri.getSpaceRevisions(args.space);

            logger.info({
            	'space': args.space,
            	'owner': space.owner,
            	'lastRevision': space.lastRevision,
            	'revisions': revisions
            });

        } catch(err) {
            logger.error('Error while getting content info for ' + args.space + ' >>> ' + err);
        }
  	});


////////////////////////////////////////////////////////////////////////////
// REVISION [LOCAL]

program
    .command('revision add')
    .description('Create a local revision')
    .argument('<space>', 'Space name')
    .argument('<file>', 'File')
    .option('-p, --parent [parent]', 'Parent revision', program.REPEATABLE, null, false)
    .option('-a, --attributes [keyValue]', 'Metadata attributes ', program.REPEATABLE, null, false) // should be REPEATABLE + regex ('/^[a-z]{3,20}=.+/i') validator
    .action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());

            // Content
            let data = fs.readFileSync(args.file);

            // metadata/attributes
            let attributes = parseKeyValue(options.attributes) || {};
            attributes.title = attributes.title || path.basename(args.file);
			attributes.mimetype = attributes.mimetype || mime.getType(fileExtension(path.basename(args.file)));
 
			// Store the revision
            let res = await kauri.createRevision(args.space, new Buffer(data), attributes, options.parent);

            // Index the revision in the local DB
            db.addRevision(args.space, res)

            logger.info('Revision ' + res + ' created');

        } catch(err) {
            logger.error('Error creating revision ' + args.file + ' >>> ' + err);
        }
    });


program
    .command('revision remove')
    .description('Remove a revision from local')
    .argument('<space>', 'Space name')
    .argument('<revision>', 'Revision hash')
	.action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());

            // Remove the revision in the local DB
            db.removeRevision(args.space, args.revision);


            logger.info('Revision ' + args.revision + ' deleted');

        } catch(err) {
            logger.error('Error removing revision ' + args.revision + ' >>> ' + err);
        }
    });

program
    .command('revision view')
    .description('Get revision')
    .argument('<space>', 'Space name')
    .argument('<revision>', 'Revision hash')
    .action(async function (args, options, logger) {

        try {

            let kauri = await Kauri.init(config.load());
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



////////////////////////////////////////////////////////////////////////////
// RUN
program.parse(process.argv);

////////////////////////////////////////////////////////////////////////////
// UTILS
function parseKeyValue(keyValues) {
	if(!keyValues) return;

	var result = {};

	if(Array.isArray(keyValues)) {
		keyValues.forEach(function(x){
		    var keyVal = splitKeyValue(x);
		    result[keyVal.key] = keyVal.value;
		});

	} else if (typeof keyValues == "string") {
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