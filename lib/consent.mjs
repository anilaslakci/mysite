// Run after localization: footer links own their explicit TR/EN copy.
export function consentHTML(content, outputPath) {
  if (!outputPath?.endsWith('.html')) return content;
  const en = /<html[^>]*lang="en"/.test(content);
  const label = en ? 'Cookie Preferences' : 'Çerez Tercihleri';
  const legacyBlog = /(?:^|[/\\])en[/\\]blog[/\\]index\.html$/.test(outputPath);
  const policy = legacyBlog ? '' : en
    ? '<a href="/en/privacy-policy/">Privacy</a><a href="/en/kvkk-disclosure/">KVKK</a><a href="/en/cookie-policy/">Cookies</a>'
    : '<a href="/gizlilik-politikasi/">Gizlilik</a><a href="/kvkk-aydinlatma-metni/">KVKK</a><a href="/cerez-politikasi/">Çerezler</a>';
  const link = `<button type="button" class="consent-footer" data-cookie-preferences>${label}</button>${policy}`;
  if(content.includes('<!--cookie-link-->'))return content.replace('<!--cookie-link-->',link);
  return content.includes('</footer>') ? content.replace('</footer>', link + '</footer>') : content.replace('</body>', `<footer data-consent-footer>${link}</footer></body>`);
}
