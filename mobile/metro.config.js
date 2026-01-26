const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Explicitly set project root for monorepo
config.projectRoot = projectRoot;

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// Force single copies of these packages to avoid duplicate React issues
const extraNodeModules = {
  '@journaling-app/shared': path.resolve(workspaceRoot, 'shared'),
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react/jsx-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-dev-runtime'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};
config.resolver.extraNodeModules = extraNodeModules;

// Block nested react copies - redirect all react imports to root
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force all react imports to use the root copy
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    return {
      filePath: require.resolve(moduleName, { paths: [workspaceRoot] }),
      type: 'sourceFile',
    };
  }

  // Use default resolution for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Add .native.ts extension resolution
config.resolver.sourceExts = ['native.tsx', 'native.ts', ...config.resolver.sourceExts];

module.exports = config;
