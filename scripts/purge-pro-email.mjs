/**
 * Purge complète d'un compte pro (Supabase).
 * Usage: node scripts/purge-pro-email.mjs pascalvezely@gmail.com [slug]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};
  const raw = readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    val = val.replace(/\\$/g, '$');
    out[m[1].trim()] = val;
  }
  return out;
}

const email = (process.argv[2] || '').trim().toLowerCase();
const slugHint = (process.argv[3] || 'pascal-vezely-guila').trim();

if (!email) {
  console.error('Usage: node scripts/purge-pro-email.mjs <email> [slug]');
  process.exit(1);
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants dans .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function tryRpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, data };
}

async function findLegacyIds() {
  const ids = new Set();

  const { data: bySlug } = await supabase
    .from('published_minisites')
    .select('legacy_local_id, nom, slug')
    .or(`slug.eq.${slugHint},nom.ilike.%Pascal%`);

  for (const row of bySlug || []) {
    if (row.legacy_local_id != null) ids.add(row.legacy_local_id);
    console.log('  trouvé (published_minisites):', row.nom, row.slug, row.legacy_local_id);
  }

  const { data: pros } = await supabase
    .from('professionals')
    .select('id, legacy_local_id, nom')
    .ilike('nom', '%Pascal%');

  for (const row of pros || []) {
    if (row.legacy_local_id != null) ids.add(row.legacy_local_id);
    console.log('  trouvé (professionals):', row.nom, row.legacy_local_id);
  }

  return [...ids];
}

async function main() {
  console.log(`\nPurge Supabase pour: ${email}\n`);

  const legacyIds = await findLegacyIds();
  if (legacyIds.length) console.log('Legacy IDs:', legacyIds.join(', '));

  let deleted = false;

  const complete = await tryRpc('delete_professional_complete', {
    p_legacy_id: legacyIds[0] ?? null,
    p_slug: slugHint,
    p_email: email,
  });
  if (complete.ok && complete.data?.deleted) {
    console.log('✓ delete_professional_complete:', complete.data);
    deleted = true;
  } else if (complete.error) {
    console.log('  delete_professional_complete:', complete.error);
  }

  for (const legacyId of legacyIds) {
    const byLegacy = await tryRpc('delete_professional_by_legacy', { p_legacy_id: legacyId });
    if (byLegacy.ok && byLegacy.data?.deleted) {
      console.log('✓ delete_professional_by_legacy:', legacyId, byLegacy.data);
      deleted = true;
    }
  }

  const bySlug = await tryRpc('delete_professional_by_slug', { p_slug: slugHint });
  if (bySlug.ok && bySlug.data?.deleted) {
    console.log('✓ delete_professional_by_slug:', bySlug.data);
    deleted = true;
  }

  if (!deleted) {
    console.log('\nAucune fiche Supabase trouvée (déjà supprimée ou migration non appliquée).');
    console.log('Appliquez supabase/migrations/20250619100000_delete_professional_complete.sql dans le SQL Editor.');
  } else {
    console.log('\n✓ Pascal supprimé de Supabase.');
  }

  console.log('\n--- Navigateur (localStorage) ---');
  console.log('Ouvrez l\'app → F12 → Console, puis exécutez :');
  console.log(`import('/src/utils/storage.js').then(m => m.releaseProEmailForNewSignup('${email}'))`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
