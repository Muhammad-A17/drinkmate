// startprobe.js — temporary probe to capture startup errors
try {
    require('./server.js');
  } catch (err) {
    const fs = require('fs');
    const out = [
      new Date().toISOString(),
      '--- STARTPROBE ERROR ---',
      err.stack || err.message || String(err),
      '--- END ---',
      '\n'
    ].join('\n');
    try { fs.appendFileSync(__dirname + '/startprobe-errors.log', out, { encoding: 'utf8' }); } catch (e) {}
    throw err;
  }
  