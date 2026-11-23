import fs from 'node:fs';

export default Object.fromEntries(
  ['site-contact', 'results', 'testimonials'].map(name => [
    name, JSON.parse(fs.readFileSync(`data/${name}.json`, 'utf8'))
  ])
);
