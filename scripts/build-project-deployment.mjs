import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateBaseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Missing GLPI base URL');
  }
  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error('GLPI base URL must be an absolute http:// or https:// URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('GLPI base URL must use http(s), include a host, and contain no credentials, query, or fragment');
  }
  return parsed.href.replace(/\/+$/, '');
}

export async function generateProjectDeployment(root) {
  const localDir = path.join(root, 'grafana', 'dashboards-local');
  const configPath = path.join(root, 'grafana', 'glpi-url.local.json');
  const sourceDir = path.join(root, 'grafana', 'dashboards');
  let configText;
  try {
    configText = await readFile(configPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Missing local GLPI URL config: ${configPath}`);
    throw error;
  }
  let config;
  try {
    config = JSON.parse(configText);
  } catch {
    throw new Error(`Malformed JSON in ${configPath}`);
  }
  const baseUrl = validateBaseUrl(config?.baseUrl);
  const main = JSON.parse(await readFile(path.join(sourceDir, 'glpi-projects.json'), 'utf8'));
  let linksUpdated = 0;

  for (const panel of main.panels ?? []) {
    for (const override of panel.fieldConfig?.overrides ?? []) {
      if (override.matcher?.options !== 'project_id') continue;
      for (const property of override.properties ?? []) {
        if (property.id !== 'links') continue;
        for (const link of property.value ?? []) {
          if (typeof link.url === 'string' && /^\/front\/project\.form\.php\?id=\$\{__value\.raw\}$/.test(link.url)) {
            link.url = `${baseUrl}/front/project.form.php?id=\${__value.raw}`;
            linksUpdated += 1;
          }
        }
      }
    }
  }
  if (linksUpdated !== 1) throw new Error(`Expected exactly one operational project link; found ${linksUpdated}`);

  await mkdir(localDir, { recursive: true });
  await writeFile(path.join(localDir, 'glpi-projects.json'), `${JSON.stringify(main, null, 2)}\n`);
  await unlink(path.join(localDir, 'glpi-projects-detail.json')).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  return { baseUrl, linksUpdated };
}

const scriptPath = path.resolve(fileURLToPath(import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const root = path.resolve(path.dirname(scriptPath), '..');
  const result = await generateProjectDeployment(root);
  console.log(`Generated local Grafana dashboards with GLPI URL ${result.baseUrl}`);
}
