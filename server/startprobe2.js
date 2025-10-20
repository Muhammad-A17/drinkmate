// startprobe2.js — robust probe that spawns node server.js and captures stdout/stderr
const fs = require('fs');
const { spawnSync } = require('child_process');

try {
  const opts = { cwd: __dirname, env: Object.assign({}, process.env), encoding: 'utf8', timeout: 20000, maxBuffer: 20 * 1024 * 1024 };
  // Use the same node binary that runs this script
  const nodeBin = process.execPath || 'node';
  const res = spawnSync(nodeBin, ['server.js'], opts);

  const out = [
    new Date().toISOString(),
    '--- STARTPROBE2 OUTPUT ---',
    `spawned: ${nodeBin} server.js`,
    `exitCode: ${res.status}`,
    `signal: ${res.signal || ''}`,
    '--- STDOUT ---',
    res.stdout || '',
    '--- STDERR ---',
    res.stderr || '',
    '--- END ---',
    '\n'
  ].join('\n');

  fs.appendFileSync(__dirname + '/startprobe-errors.log', out, { encoding: 'utf8' });
  // Exit with the same status so Passenger knows it failed
  process.exit(res.status || 1);
} catch (err) {
  const out = [
    new Date().toISOString(),
    '--- STARTPROBE2 CRASH ---',
    err.stack || err.message || String(err),
    '--- END ---',
    '\n'
  ].join('\n');
  try { fs.appendFileSync(__dirname + '/startprobe-errors.log', out, { encoding: 'utf8' }); } catch (e) {}
  process.exit(1);
}
