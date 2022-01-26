var express = require('express');
var router = express.Router();

const corsAnywhere = require('cors-anywhere');
const apicache = require('apicache');
const expressHttpProxy = require('express-http-proxy');
const CORS_PROXY_PORT = 8090;

corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => {
    console.log(
        `Internal CORS Proxy server started at port ${CORS_PROXY_PORT}`
    );
});

router.get('/*', cacheMiddleware());
router.options('/*', cacheMiddleware());
router.use(expressHttpProxy(`localhost:${CORS_PROXY_PORT}`));

function cacheMiddleware() {
    const cacheOptions = {
        statusCodes: {
            include: [200]
        },
        defaultDuration: 60000,
        appendKey: (req, res) => req.method
    };
    let cacheMiddleware = apicache.options(cacheOptions).middleware();
    return cacheMiddleware;
}

module.exports = router;
