const fs = require('fs');
const path = require('path');

function pathJoin(base, addition) {
  if (base === '/') base = '';
  if (addition === null || addition === undefined) addition = '';

  if (base === '' && addition.startsWith('/')) {
    // No change needed
  } else if (base === '' && addition === '') {
    return '/';
  } else if (base === '') {
    addition = `/${addition}`;
  } else if (addition.startsWith('/')) {
    // No change needed
  } else {
    addition = `/${addition}`;
  }

  const full = `${base}${addition}`;
  const normalized = full.replace(/\/+/g, '/');

  return normalized.endsWith('/') && normalized !== '/' ? normalized.slice(0, -1) : normalized || '/';
}

function getMountPathFromLayer(layer) {
  if (!layer || !layer.regexp || !layer.regexp.source) {
    return '';
  }

  const re = layer.regexp.source;

  if (re === '^\\/?(?=\\/|$)' || re === '^\\/(?=\\/?$)' || re === '^\\/(?!\\w)') {
    return '';
  }

  const match = re.match(/^\^\\\/((?:[^\\\/()?$*+]|\\.)*)/);

  if (match && match[1]) {
    const patternToReplace = "\\/";
    const flags = "g";
    const searchRegex = new RegExp(patternToReplace, flags);
    const extractedPath = match[1].replace(searchRegex, '/');

    if (extractedPath.endsWith('/?')) {
      return extractedPath.substring(0, extractedPath.length - 2);
    }
    return extractedPath;
  }

  return '';
}

function extractRoutes(stack, parentPath = '') {
  const routes = [];

  if (!stack || !Array.isArray(stack)) {
    return routes;
  }

  stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const routePath = pathJoin(parentPath, layer.route.path);
      Object.keys(layer.route.methods).forEach(method => {
        if (layer.route.methods[method]) {
          routes.push({ method: method.toUpperCase(), path: routePath });
        }
      });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const mountPath = getMountPathFromLayer(layer);
      const newParentPath = pathJoin(parentPath, mountPath);
      routes.push(...extractRoutes(layer.handle.stack, newParentPath));
    } else if (layer.name === 'mounted_app' && layer.handle && layer.handle._router && layer.handle._router.stack) {
      const mountPath = getMountPathFromLayer(layer);
      const newParentPath = pathJoin(parentPath, mountPath);
      routes.push(...extractRoutes(layer.handle._router.stack, newParentPath));
    }
  });

  return routes;
}

function generateAndSaveRoutes(app, outputPathSuffix = 'exocore-web/models/routes.json') {
  let routerStack;

  if (app && app._router && app._router.stack) {
    routerStack = app._router.stack;
  } else if (app && app.router && Array.isArray(app.router.stack)) {
    routerStack = app.router.stack;
  } else if (app && app.router && typeof app.router === 'function' && app.router.stack && Array.isArray(app.router.stack) ){
    routerStack = app.router.stack;
  } else if (app && typeof app.stack === 'function' && app.stack && Array.isArray(app.stack)) {
    routerStack = app.stack;
  } else if (app && app.routes && app.routes.stack && Array.isArray(app.routes.stack) ){
     routerStack = app.routes.stack;
  }


  if (!routerStack || !Array.isArray(routerStack)) {
    console.error('[pathsRoutes.js] Could not find a valid router stack on the Express app instance.');
    console.error('[pathsRoutes.js] Tried app._router.stack, app.router.stack, and app.stack.');
    if (app) {
      console.error('[pathsRoutes.js] Keys of the provided app object:', Object.keys(app));
      if (app.router && typeof app.router === 'object') {
        console.error('[pathsRoutes.js] Keys of app.router:', Object.keys(app.router));
        console.error('[pathsRoutes.js] Type of app.router.stack:', typeof app.router.stack);
      } else if (app.router && typeof app.router === 'function') {
        console.error('[pathsRoutes.js] app.router is a function.');
      }
    } else {
      console.error('[pathsRoutes.js] Provided app object is null or undefined.');
    }
    return;
  }

  const detectedRoutes = extractRoutes(routerStack);

  if (detectedRoutes.length === 0) {
    console.warn('[pathsRoutes.js] No routes detected. This might be an issue with stack traversal or an empty app.');
  } else {
    detectedRoutes.sort((a, b) => {
      if (a.path < b.path) return -1;
      if (a.path > b.path) return 1;
      if (a.method < b.method) return -1;
      if (a.method > b.method) return 1;
      return 0;
    });
  }

  const defaultRelativePath = '../';
  const baseDir = path.join(__dirname, defaultRelativePath);
  const outputPath = path.join(baseDir, outputPathSuffix);

  try {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`[pathsRoutes.js] Created output directory: ${outputDir}`);
    }
    fs.writeFileSync(outputPath, JSON.stringify({ routes: detectedRoutes }, null, 2), 'utf8');
    console.log(`[pathsRoutes.js] Successfully saved ${detectedRoutes.length} routes to ${outputPath}`);
  } catch (err) {
    console.error(`[pathsRoutes.js] Error writing routes file to ${outputPath}:`, err);
  }
}

module.exports = generateAndSaveRoutes;
