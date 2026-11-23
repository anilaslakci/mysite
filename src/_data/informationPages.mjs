import { informationPairs } from '../../lib/information.mjs';

export default informationPairs.flatMap(pair => ['tr','en'].map(locale => ({
  key: pair.key, locale, url: pair[locale], title: pair.titles[locale], description: pair.descriptions[locale]
})));
