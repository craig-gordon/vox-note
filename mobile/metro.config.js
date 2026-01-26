const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force resolving shared package from the workspace
config.resolver.extraNodeModules = {
  '@journaling-app/shared': path.resolve(workspaceRoot, 'shared'),
};

// Add .native.ts extension resolution
config.resolver.sourceExts = ['native.tsx', 'native.ts', ...config.resolver.sourceExts];

module.exports = config;
