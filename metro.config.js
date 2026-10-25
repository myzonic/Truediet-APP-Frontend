const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = config.resolver;

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = assetExts.filter((extension) => extension !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

config.resolver.unstable_enablePackageExports = true;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-file-system/legacy') {
    return context.resolveRequest(context, 'expo-file-system', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
