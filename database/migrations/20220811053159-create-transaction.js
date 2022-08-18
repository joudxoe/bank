'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const { INTEGER, STRING } = Sequelize;
    await queryInterface.createTable('transaction', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      deposit: {
        type: STRING(20),
        allowNull: true,
        comment: '存款金額',
      },
      withdraw: {
        type: STRING(20),
        allowNull: true,
        comment: '提款金額',
      },
      balance: {
        type: STRING(20),
        allowNull: true,
        comment: '結餘',
      },
      created: {
        type: STRING(30),
        allowNull: true,
        defaultValue: '',
        comment: '存提款時間',
      },
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('transaction');
  }
};
