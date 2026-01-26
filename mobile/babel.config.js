module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@journaling-app/shared': '../shared/src',
          },
        },
      ],
    ],
  };
};
