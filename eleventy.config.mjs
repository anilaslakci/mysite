export default function (eleventyConfig) {
  // Legacy media paths are a public contract. Only the explicit asset folders
  // are copied; migration records and local recovery archives are never output.
  eleventyConfig.addPassthroughCopy({ assets: 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  for (const file of ['CNAME', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'favicon.png', 'favicon-48x48.png', 'favicon-96x96.png']) {
    eleventyConfig.addPassthroughCopy({ [file]: file });
  }
  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
    templateFormats: ['njk'],
    pathPrefix: '/',
    htmlTemplateEngine: 'njk'
  };
}
