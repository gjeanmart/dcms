"use strict";

(async () => {

    module.exports = {
        _HOST: process.env.HOST || "localhost",
        _PORT: process.env.PORT || 8080,
        _MNEMONIC: process.env.MNEMONIC || "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
        _MNEMONIC_INDEX: process.env.MNEMONIC_INDEX || 0,
        _RPC_URL: process.env.RPC_URL || "http://localhost:8545",
        _API_HOST: process.env.API_HOST || "localhost",
        _API_PORT: process.env.API_PORT || 8080,
        _API_CONTEXT: process.env.API_CONTEXT || "/",
        _TRUFFLE_ENDPOINT_PROTOCOL: process.env.TRUFFLE_PROTOCOL || "http",
        _TRUFFLE_ENDPOINT_HOST: process.env.TRUFFLE_ENDPOINT_HOST || "localhost",
        _TRUFFLE_ENDPOINT_PORT: process.env.TRUFFLE_ENDPOINT_PORT || 8888,
        _TRUFFLE_ENDPOINT_PATH: process.env.TRUFFLE_ENDPOINT_PATH || "/api",
        _GAS_PRICE: process.env.GAS_PRICE || 1000000000,

        _CONTRACT_NAME: "ContentSpaceRegistry"
    }

})();
