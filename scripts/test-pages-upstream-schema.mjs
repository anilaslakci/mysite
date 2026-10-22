// Validates using the actual upstream ConfigSchema. Optional network preparation
// is kept outside the site dependency graph in an ignored tooling directory.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { stripTypeScriptTypes, createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url), yaml = require('js-yaml');
const dir = '.migration-preview/pagescms-schema';
assert(fs.existsSync(`${dir}/config-schema.ts`), 'Upstream schema cache missing; see migration/phase-3/README.md');
const source = fs.readFileSync(`${dir}/config-schema.ts`,'utf8');
const registry = fs.readFileSync(`${dir}/registry.ts`,'utf8');
const types = [...registry.matchAll(/registerField\("([^"]+)"/g)].map(m=>m[1]);
assert(types.includes('image') && types.includes('text'));
const adapted = source.replace('import { fieldTypes } from "@/fields/registry";', `const fieldTypes = new Set(${JSON.stringify(types)});`);
assert.notEqual(adapted,source,'Upstream registry import changed');
fs.writeFileSync(`${dir}/config-runtime.mjs`,stripTypeScriptTypes(adapted,{mode:'transform'}));
const { ConfigSchema } = await import(pathToFileURL(path.resolve(`${dir}/config-runtime.mjs`)));
const config = yaml.load(fs.readFileSync('.pages.yml','utf8'));
const parsed=ConfigSchema.safeParse(config);
assert(parsed.success,JSON.stringify(parsed.error?.issues,null,2));
const unknown=structuredClone(config); unknown.content[0].unsupported_option=true;
assert(!ConfigSchema.safeParse(unknown).success,'Unknown keys should be rejected');
const invalidType=structuredClone(config);invalidType.content[0].fields[0].type='made-up-field';
assert(!ConfigSchema.safeParse(invalidType).success,'Invalid field type should be rejected');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync('migration/phase-7/upstream-schema-results.json',JSON.stringify({passed:true,validator:'Official Pages CMS ConfigSchema',schemaUrl:'https://raw.githubusercontent.com/hunvreus/pagescms/main/lib/config-schema.ts',schemaSha256:hash(source),registrySha256:hash(registry),upstreamVersion:JSON.parse(fs.readFileSync(`${dir}/upstream-package.json`)).version,types,negativeChecks:2,adaptation:'Only fieldTypes registry import replaced by names extracted from official registry; TypeScript erased with Node. No rules modified.',editorTested:false},null,2)+'\n');
console.log('Official ConfigSchema accepts .pages.yml; both unknown key/type negative checks rejected.');
