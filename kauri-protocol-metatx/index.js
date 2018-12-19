// index.js

////////////////////////////////////////////////////////////////////////
// IMPORTS
const   constant            = require('./helpers/constant'),
        HDWalletProvider  = require('truffle-hdwallet-provider')
        SmartContract       = require('./helpers/smart-contract'),
        express             = require('express'), 
        bodyParser          = require('body-parser'),
        cors                = require('cors'),
        fs                  = require('fs');


// INIT
// =============================================================================
const provider = new HDWalletProvider(constant._MNEMONIC, constant._RPC_URL, constant._MNEMONIC_INDEX);
const smartContract = new SmartContract(provider, provider.getAddress(constant._MNEMONIC_INDEX));



// API
// =============================================================================
var app    = express();    
var router = express.Router();

router.post('/relay/space', async function (req, res, next) {
    console.log("[DEBUG] HTTP POST /relay/space", req.body) ; 

    const tx = await smartContract.metaCreateSpace(
        req.body.id, 
        req.body.owner, 
        req.body.signature, 
        req.body.nonce);
    console.log("[DEBUG] tx="+tx);

    res.json({ "tx": tx }); 
});

router.post('/relay/revision', async function (req, res, next) {
    console.log("[DEBUG] HTTP POST /relay/revision", req.body) ; 

    const tx = await smartContract.metaPushRevision(
        req.body.id, 
        req.body.hash,
        req.body.parentHash,  
        req.body.signature, 
        req.body.nonce);
    console.log("[DEBUG] tx="+tx);

    res.json({ "tx": tx }); 
});

router.post('/relay/revision/approve', async function (req, res, next) {
    console.log("[DEBUG] HTTP POST /relay/revision/approve", req.body) ; 

    const tx = await smartContract.metaApproveRevision(
        req.body.id, 
        req.body.hash, 
        req.body.signature, 
        req.body.nonce);
    console.log("[DEBUG] tx="+tx);

    res.json({ "tx": tx }); 
});

router.post('/relay/revision/reject', async function (req, res, next) {
    console.log("[DEBUG] HTTP POST /relay/revision/reject", req.body) ; 

    const tx = await smartContract.metaRejectRevision(
        req.body.id, 
        req.body.hash, 
        req.body.signature, 
        req.body.nonce);
    console.log("[DEBUG] tx="+tx);

    res.json({ "tx": tx }); 
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(constant._API_CONTEXT, router);


// Run
// =============================================================================
console.log('[INFO] Starting kauri-protocol-relay-backend');
app.listen(constant._PORT, constant._HOST, () => {
    console.log('[INFO] listening on ' + constant._HOST + ":" + constant._PORT)
})