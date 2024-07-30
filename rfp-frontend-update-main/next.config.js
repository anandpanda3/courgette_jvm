const withTM = require('next-transpile-modules')(['a-multilayout-splitter']);

    module.exports = withTM({
    reactStrictMode: true,
    
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    },
  });