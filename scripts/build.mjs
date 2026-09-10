import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..');
const OUTPUT_DIRECTORY = path.join(ROOT_DIRECTORY, 'dist');
const VERSION_PLACEHOLDER = '__USERSCRIPT_VERSION__';
const USER_SCRIPT_OUTPUT_PATTERN = /^[a-z0-9][a-z0-9.-]*\.user\.js$/;
const USER_SCRIPT_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function assertString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function replaceUserscriptVersion(sourceCode, version) {
  const placeholderCount = sourceCode.split(VERSION_PLACEHOLDER).length - 1;
  if (placeholderCount !== 1) {
    throw new Error(`source must contain exactly one ${VERSION_PLACEHOLDER}`);
  }
  return sourceCode.replace(VERSION_PLACEHOLDER, version);
}

function renderIndex({ description, output, title, version }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; background: #f5f7fb; color: #172033; }
    main { width: min(720px, calc(100% - 32px)); margin: 64px auto; }
    h1 { margin-bottom: 8px; font-size: clamp(28px, 5vw, 40px); }
    .intro { margin: 0 0 32px; color: #657087; }
    .card { display: flex; min-height: 180px; flex-direction: column; justify-content: space-between; padding: 28px; border: 1px solid #dce2ec; border-radius: 18px; background: #fff; box-shadow: 0 12px 32px rgb(23 32 51 / 7%); }
    .card h2 { margin: 0 0 12px; font-size: 22px; }
    .card p { margin: 0; color: #657087; line-height: 1.6; font-size: 15px; }
    footer { display: flex; align-items: center; justify-content: space-between; margin-top: 32px; }
    footer span { color: #7a8498; font-size: 14px; }
    a { padding: 10px 18px; border-radius: 10px; background: #e24329; color: #fff; font-weight: 650; text-decoration: none; transition: background 0.15s; }
    a:hover { background: #d13a22; }
    @media (prefers-color-scheme: dark) {
      body { background: #111522; color: #f0f2f8; }
      .intro, .card p, footer span { color: #aeb6c8; }
      .card { border-color: #30384a; background: #1a2030; box-shadow: none; }
    }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p class="intro">浏览器增强脚本。点击安装后由 Tampermonkey / Violentmonkey 自动检查更新。</p>
    <article class="card">
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      <footer>
        <span>v${escapeHtml(version)}</span>
        <a href="./${encodeURIComponent(output)}">安装脚本</a>
      </footer>
    </article>
  </main>
</body>
</html>
`;
}

export async function buildUserscript() {
  const packageJsonPath = path.join(ROOT_DIRECTORY, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const version = assertString(packageJson.version, 'version');
  if (!USER_SCRIPT_VERSION_PATTERN.test(version)) {
    throw new Error('version must use semantic versioning');
  }

  const userscript = packageJson.userscript;
  if (!userscript || typeof userscript !== 'object' || Array.isArray(userscript)) {
    throw new Error('userscript configuration is required');
  }

  const source = assertString(userscript.source, 'userscript.source');
  const output = assertString(userscript.output, 'userscript.output');
  const title = assertString(userscript.title, 'userscript.title');
  if (!USER_SCRIPT_OUTPUT_PATTERN.test(output)) {
    throw new Error('userscript.output must be a safe *.user.js filename');
  }

  const sourcePath = path.resolve(ROOT_DIRECTORY, source);
  const rootPrefix = `${ROOT_DIRECTORY}${path.sep}`;
  if (!sourcePath.startsWith(rootPrefix)) {
    throw new Error('userscript.source must stay inside the repository');
  }

  const sourceCode = await readFile(sourcePath, 'utf8');
  const builtSourceCode = replaceUserscriptVersion(sourceCode, version);

  await rm(OUTPUT_DIRECTORY, { force: true, recursive: true });
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  await writeFile(path.join(OUTPUT_DIRECTORY, output), builtSourceCode, 'utf8');
  await writeFile(
    path.join(OUTPUT_DIRECTORY, 'index.html'),
    renderIndex({
      description: typeof packageJson.description === 'string' ? packageJson.description : '',
      output,
      title,
      version,
    }),
    'utf8',
  );

  console.log(`Built ${output} (v${version}) in ${OUTPUT_DIRECTORY}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildUserscript();
}
