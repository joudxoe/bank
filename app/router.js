'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.bank.index);
  router.post('/withdraw', controller.bank.withdraw);
  router.post('/deposit', controller.bank.deposit);
};
