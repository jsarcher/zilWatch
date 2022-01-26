var express = require('express');
var router = express.Router();

const corsAnywhere = require('cors-anywhere');
const httpProxy = require('http-proxy');
const CORS_PROXY_PORT = 8090;

corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => {
    console.log(
        `Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`
    );
});

let apiProxy = httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: CORS_PROXY_PORT
    }
});

router.get("/*", function (req, res) {
    // Special handling for beanterra, it redirects to www which the cors proxy cannot handle here.
    // We cannot find a way to redirect to our `localhostname/proxy/<redirected_path>`
    // It always go to `localhostname/<redirected_path>`, which will be 404.
    if (req.url.includes("/beanterra.io")) {
        req.url = req.url.replace("/beanterra.io", "/www.beanterra.io")
    }

    apiProxy.web(req, res, {});
});

module.exports = router;
