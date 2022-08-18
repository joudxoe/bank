'use strict';

module.exports = app => {
    const { INTEGER, STRING } = app.Sequelize;
    const Transaction = app.model.define('transaction', {
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
    });
    return Transaction;
};