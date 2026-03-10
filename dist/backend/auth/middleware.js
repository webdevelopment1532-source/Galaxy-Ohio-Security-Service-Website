"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = verifyJwt;
exports.verifyHmac = verifyHmac;
// JWT and HMAC middleware
var jwt = require("jsonwebtoken");
var crypto = require("crypto");
function verifyJwt(req, res, next) {
    var _a, _b;
    var token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Missing JWT.' });
    try {
        var secret = (_b = process.env.OHIO_INTEGRATION_SECRET) !== null && _b !== void 0 ? _b : '';
        jwt.verify(token, secret);
        next();
    }
    catch (_c) {
        return res.status(401).json({ error: 'Invalid JWT.' });
    }
}
function verifyHmac(req, res, next) {
    var _a;
    var signature = req.headers['x-galaxy-signature'];
    var timestamp = req.headers['x-galaxy-timestamp'];
    if (!signature || !timestamp)
        return res.status(401).json({ error: 'Missing HMAC headers.' });
    var body = JSON.stringify(req.body);
    var secret = (_a = process.env.OHIO_INTEGRATION_SECRET) !== null && _a !== void 0 ? _a : '';
    var hmac = crypto.createHmac('sha256', secret).update(timestamp + body).digest('hex');
    if (hmac !== signature)
        return res.status(401).json({ error: 'Invalid HMAC signature.' });
    next();
}
