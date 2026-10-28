// Génère src/environments/environment.ts à partir de .env (ou de la variable d'environnement
// PRIM_API_KEY). Angular ne lit pas .env tout seul : ce script est lancé automatiquement avant
// `npm start`, `npm run build`, `npm test` et `npm run watch` (hooks npm « pre… »).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const ENV_FILE = '.env';
const OUTPUT_FILE = 'src/environments/environment.ts';
const PLACEHOLDER = 'Put your PRISM API key here';

function readKey() {
  if (process.env.PRIM_API_KEY) {
    return process.env.PRIM_API_KEY.trim();
  }
  if (!existsSync(ENV_FILE)) {
    return '';
  }
  const line = readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .find((l) => /^\s*PRIM_API_KEY\s*=/.test(l));
  if (!line) {
    return '';
  }
  return line
    .slice(line.indexOf('=') + 1)
    .trim()
    .replace(/^["']|["']$/g, '');
}

const key = readKey();
const isValid = key !== '' && key !== PLACEHOLDER;

if (!isValid) {
  console.warn(
    `[generate-env] PRIM_API_KEY absente ou non renseignée (${ENV_FILE}) : les appels à l'API PRIM seront refusés.`,
  );
}

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(
  OUTPUT_FILE,
  `// Fichier généré par scripts/generate-env.mjs : ne pas modifier, ne pas commiter.\n` +
    `export const environment = {\n  primApiKey: ${JSON.stringify(isValid ? key : '')},\n};\n`,
);
console.log(`[generate-env] ${OUTPUT_FILE} généré (${isValid ? 'clé trouvée' : 'sans clé'}).`);
