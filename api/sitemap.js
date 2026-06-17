import { genererSitemap } from '../src/utils/generateSitemap.js';

export default function handler(req, res) {
  const xml = genererSitemap();
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
}
