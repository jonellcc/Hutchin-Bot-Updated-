const fs = require('fs');
const path = require('path');

function extractRoutesRecursive(stack, parentPath) {
  const routes = [];
  if (!stack) {
    return routes;
  }

  stack.forEach(layer => {
    if (layer.route) {
      const routePath = layer.route.path;
      Object.keys(layer.route.methods).forEach(method => {
        if (layer.route.methods[method]) {
          let fullPath = `${parentPath}${routePath}`.replace(/\/\//g, '/');
          if (fullPath !== '/' && fullPath.endsWith('/')) {
            fullPath = fullPath.slice(0, -1);
          }
          routes.push({
            method: method.toUpperCase(),
            path: fullPath || '/',
          });
        }
      });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      let subRouterMountPath = '';
      if (layer.regexp) {
        const source = layer.regexp.source;
        if (source === "^\\/(.*)" || source === "^\\/?(?=\\/|$)") {
             subRouterMountPath = '/';
        } else {
            const match = source.match(/^\^((?:\\\/[^\\\/]+)*)/);
            if (match && match[1]) {
                subRouterMountPath = match[1].replace(/\\\//g, '/');
            }
        }
      }

      let newParentPath = parentPath;
      if (subRouterMountPath && subRouterMountPath !== '/') {
        newParentPath = `${parentPath}${subRouterMountPath}`.replace(/\/\//g, '/');
      } else if (parentPath === '' && subRouterMountPath === '/') {
        newParentPath = '/';
      }

      if (newParentPath !== '/' && newParentPath.endsWith('/')) {
        newParentPath = newParentPath.slice(0,-1);
      }
      routes.push(...extractRoutesRecursive(layer.handle.stack, newParentPath));
    }
  });
  return routes;
}

function generateAndSaveRoutes(expressAppInstance) {
  if (!expressAppInstance || !expressAppInstance._router || !expressAppInstance._router.stack) {
    console.error('[pathsRoutes.js] Invalid Express app instance provided or router stack not accessible.');
    return;
  }

  console.log('[pathsRoutes.js] Detecting routes from the provided Express app...');
  const allDetectedRoutes = extractRoutesRecursive(expressAppInstance._router.stack, '');

  const uniqueRoutes = [];
  const seenRoutes = new Set();
  for (const route of allDetectedRoutes) {
    const routeKey = `${route.method} ${route.path}`;
    if (!seenRoutes.has(routeKey)) {
      uniqueRoutes.push(route);
      seenRoutes.add(routeKey);
    }
  }

  uniqueRoutes.sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    if (a.method < b.method) return -1;
    if (a.method > b.method) return 1;
    return 0;
  });

  const outputData = { routes: uniqueRoutes };
  const outputPath = path.join(__dirname, '../exocore-web/models/routes.json');

  try {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`[pathsRoutes.js] Successfully wrote ${uniqueRoutes.length} detected routes to ${outputPath}`);
  } catch (err) {
    console.error(`[pathsRoutes.js] Error writing routes to get ${outputPath}:`, err);
  }
}

module.exports = generateAndSaveRoutes;
