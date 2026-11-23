import fs from 'node:fs';

const variants = JSON.parse(fs.readFileSync('data/image-variants.json', 'utf8'));
const sizes = new Map();

function dimensions(src) {
  if (sizes.has(src)) return sizes.get(src);
  const bytes = fs.readFileSync(src.slice(1));
  let size;
  if (/\.png$/i.test(src)) {
    size = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  } else {
    for (let i = 2; i + 8 < bytes.length;) {
      const marker = bytes[i + 1];
      if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
        size = [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)];
        break;
      }
      if (bytes[i] !== 0xff || marker === 0xda) break;
      i += 2 + bytes.readUInt16BE(i + 2);
    }
  }
  if (!size?.every(Boolean)) throw new Error('Missing image dimensions: ' + src);
  sizes.set(src, size);
  return size;
}

export function socialImage(src) {
  return variants[src]?.full.url || src || '/favicon.png';
}

// The CMS keeps its original paths. New uploads still get intrinsic dimensions
// and the original fallback until the optional optimizer is run again.
export function optimizeHTML(html, outputPath) {
  if (!outputPath?.endsWith('.html') || /(?:^|[/\\])en[/\\]blog[/\\]index\.html$/.test(outputPath)) return html;
  return html.replace(/<img\b[^>]*>/g, tag => {
    const src = tag.match(/\bsrc="(?:\.?\/)?(assets\/[^"]+\.(?:png|jpe?g))"/i)?.[1];
    if (!src) return tag;
    const url = '/' + src;
    // Some build fixtures deliberately use a separate asset root.
    if (!fs.existsSync(src)) return tag;
    const [width, height] = dimensions(url);
    let image = tag.replace(/\s(?:width|height)="\d+"/g, '').replace(/\s*\/?>$/, ` width="${width}" height="${height}">`);
    const isProfile = url === '/assets/mustafa-anil-aslakci.jpg';
    const isGallery = src.startsWith('assets/portfolio/');
    const media = variants[url];
    if (isGallery) image = image.replace('<img ', `<img data-full="${url}" `);
    if (isProfile) image = image.replace('loading="lazy"', 'loading="eager" fetchpriority="high"');
    if (!media) return image;
    const isFull = image.includes('post-cover') || (!isGallery && !isProfile && image.includes('decoding="async"'));
    const responsive = (isProfile || isGallery) && media.preview.width < media.full.width;
    const srcset = responsive
      ? `${media.preview.url} ${media.preview.width}w, ${media.full.url} ${media.full.width}w`
      : media[isFull ? 'full' : 'preview'].url;
    const sizes = isProfile
      ? '(max-width: 760px) 90vw, 400px'
      : '(max-width: 620px) calc(100vw - 62px), (max-width: 1240px) 44vw, 550px';
    return `<picture><source type="image/webp" srcset="${srcset}"${responsive ? ` sizes="${sizes}"` : ''}>${image}</picture>`;
  });
}
