import fs from 'node:fs';
import path from 'node:path';
const root = fs.realpathSync(process.cwd());
const output = path.resolve(root, '_site');
if (path.dirname(output) !== root || path.basename(output) !== '_site') throw Error('Unsafe build output path');
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw Error('Refusing symlink output');
fs.rmSync(output, { recursive: true, force: true });
