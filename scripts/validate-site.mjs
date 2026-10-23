import {execFileSync} from 'node:child_process';
// Freeze one clock for the build and all output assertions, including minute boundaries.
const env={...process.env,SITE_BUILD_TIME:process.env.SITE_BUILD_TIME||new Date().toISOString().replace(/\.\d{3}Z$/,'Z')};
for(const script of ['scripts/clean-site.mjs','node_modules/@11ty/eleventy/cmd.cjs','scripts/test-portfolio-runtime.mjs','scripts/test-blog-output.mjs','scripts/test-translation-coverage.mjs','scripts/test-consent.mjs','scripts/test-ux.mjs'])execFileSync(process.execPath,[script],{env,stdio:'inherit'});
