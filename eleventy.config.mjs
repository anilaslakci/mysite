import { imagePath } from './lib/portfolio.mjs';
import {site,safeJSON,postStructuredData} from './lib/blog.mjs';
import {sitemap,rss} from './lib/blog-feeds.mjs';
import {localizeHTML,alternates,languageNav} from './lib/i18n.mjs';
export default function (eleventyConfig) {
  eleventyConfig.addTransform('localize',localizeHTML);
  eleventyConfig.addFilter('alternateHTML',alternates);
  eleventyConfig.addFilter('languageHTML',languageNav);
  eleventyConfig.addWatchTarget('./src/i18n/');
  eleventyConfig.addFilter('portfolioImage', imagePath);
  eleventyConfig.addWatchTarget('./src/content/projects/');
  eleventyConfig.addWatchTarget('./src/content/categories/');
  eleventyConfig.addWatchTarget('./src/content/media/');
  eleventyConfig.addWatchTarget('./src/content/posts/');
  eleventyConfig.addWatchTarget('./src/content/blog-categories/');
  eleventyConfig.addFilter('jsonScript',safeJSON);
  eleventyConfig.addFilter('postSchema',postStructuredData);
  eleventyConfig.addFilter('sitemapXML',sitemap);
  eleventyConfig.addFilter('rssXML',rss);
  eleventyConfig.addFilter('editorialDate',(value,locale='tr')=>new Intl.DateTimeFormat(locale==='en'?'en-GB':'tr-TR',{timeZone:site.timeZone,dateStyle:'long'}).format(new Date(value)));
  eleventyConfig.addFilter('blogIndexSchema',blog=>({'@context':'https://schema.org','@type':'CollectionPage',name:'Blog | '+site.name,url:site.url+blog.url,inLanguage:blog.locale,mainEntity:{'@type':'ItemList',itemListElement:blog.posts.map((p,i)=>({'@type':'ListItem',position:i+1,url:p.canonical,name:p.title}))}}));
  // Legacy media paths are a public contract. Only the explicit asset folders
  // are copied; migration records and local recovery archives are never output.
  eleventyConfig.addPassthroughCopy({ assets: 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  for (const file of ['CNAME', 'favicon.ico', 'favicon.png', 'favicon-48x48.png', 'favicon-96x96.png']) {
    eleventyConfig.addPassthroughCopy({ [file]: file });
  }
  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
    templateFormats: ['njk'],
    pathPrefix: '/',
    htmlTemplateEngine: 'njk'
  };
}
