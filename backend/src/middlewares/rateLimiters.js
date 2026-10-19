const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: {error: 'Demasiados intentos'}
});

module.exports = {loginLimiter};