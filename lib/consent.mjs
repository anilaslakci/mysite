// Run after localization: consent UI owns its explicit TR/EN copy.
export function consentHTML(content, outputPath) {
  if (!outputPath?.endsWith('.html')) return content;
  const label = /<html[^>]*lang="en"/.test(content) ? 'Cookie Preferences' : 'Çerez Tercihleri';
  const link = `<button type="button" class="consent-footer" data-cookie-preferences>${label}</button>`;
  return content.includes('</footer>') ? content.replace('</footer>', link + '</footer>') : content.replace('</body>', `<footer data-consent-footer>${link}</footer></body>`);
}
