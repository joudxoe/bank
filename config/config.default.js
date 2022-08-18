/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1659583191583_7290';

  // add your middleware config here
  config.middleware = [];    

  exports.security = {
    csrf: {
      enable: false,
    },
  };

  exports.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
      '.html': 'nunjucks',
      '.njk': 'nunjucks',
    },
  };

  config.redis = {
    client: {
      host: '127.0.0.1',
      port: 6379,
      password: 'redis',
      db: 0,
    },    
  };

  exports.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root1234',
    database: 'bank',
    timezone: '+08:00',
    define: {
      tableName: 'transaction',
      timestamps: false,
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
