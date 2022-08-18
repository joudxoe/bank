'use strict';

const { ajax } = require('jquery');

const Controller = require('egg').Controller;

module.exports = app => {
  return class BankController extends app.Controller {
    async index() {
      const { ctx, app } = this;         
      // 檢查balance key是否設定
      const haveBalance = await app.redis.exists('balance');
      if (!haveBalance) {
        // 取出資料庫的餘額
        let myBalance = await ctx.model.Transaction.findOne({
          attributes: ['balance'],
          order: [
            ['id', 'desc']
          ],
          limit: 1, 
          offset: 0,
        });
        if (myBalance) {
          myBalance = Number(myBalance.balance.replace('$', ''));
          await app.redis.set('balance', myBalance);
        } else {
          await app.redis.set('balance', 0);
        }  
        ctx.session.lLen = 0;      
      }
      // 取得列表長度
      const lLen = await app.redis.llen('times');
      const sLen = ctx.session.lLen;
      const loop = lLen - sLen;
      // 取出列表的交易明細
      const lsTime = await app.redis.lrange('times', sLen, -1);
      const lsWithdraw = await app.redis.lrange('withdraw', sLen, -1);
      const lsDeposit = await app.redis.lrange('deposit', sLen, -1);  
      const lsBalance = await app.redis.lrange('balances', sLen, -1);           
      if (lLen > 0) {
        let arrTrans = [];
        // 將交易明細儲存至陣列
        for (let i = 0; i < loop; i++) {
          arrTrans.push({
            'withdraw': lsWithdraw[i],
            'deposit': lsDeposit[i],
            'balance': lsBalance[i],
            'created': lsTime[i],
          });            
        }
        if (lLen > sLen) {
          // 寫入交易明細至資料庫
          await ctx.model.Transaction.bulkCreate(arrTrans);
          ctx.session.lLen = ctx.session.lLen + loop;
        }
      }
      // 取出資料庫的交易明細
      const rows = await ctx.model.Transaction.findAll({
        order: [
          ['id', 'desc']
        ],
      });
      await ctx.render('index.html', {
        rows: rows,
        lLen: lLen,
        sLen: sLen,
        loop: loop,
      });
    }
    // 提款
    async withdraw() {
      const { ctx, app } = this;
      // 檢查balance key是否設定
      const isExist = await app.redis.exists('balance');
      if (!isExist) {
        // 取出資料庫的餘額
        let myBalance = await ctx.model.Transaction.findOne({
          attributes: ['balance'],
          order: [
            ['id', 'desc']
          ],
          limit: 1,
          offset: 0,
        });
        if (myBalance) {
          myBalance = Number(myBalance.balance.replace('$', ''));
          await app.redis.set('balance', myBalance);
        } else {
          await app.redis.set('balance', 0);
        }        
      }      
      // 取得餘額
      let balance = await app.redis.get('balance');
      // 取得提款金額
      let withdraw = ctx.request.body.withdraw;
      // 提款金額若大於餘額，則無法取款
      if (Number(withdraw) > Number(balance)) {
        const err = '餘額不足，無法提款';
      } else {
        // 從餘額減去提款金額
        await app.redis.decrby('balance', withdraw);
        // 提款時間       
        let withdrawTime = this.dateTime();
        withdrawTime.then(
          (result) => {
            withdrawTime = result;
          }
        );
        // 取得減去提款金額後的餘額
        balance = await app.redis.get('balance');
        // 提款金額格式
        const withdrawForm = '$' + Number(withdraw).toFixed(2);
        const balanceForm = '$' + Number(balance).toFixed(2);  
        // 取得未寫入交易明細至List的列表長度
        const lLen = await app.redis.llen('times');
        ctx.session.lLen = lLen;
        // 存入列表用做交易明細
        await app.redis.rpush('times', withdrawTime);
        await app.redis.rpush('withdraw', withdrawForm);
        await app.redis.rpush('deposit', '');
        await app.redis.rpush('balances', balanceForm);
      }
      ctx.redirect('/');
    }
    // 存款
    async deposit() {
      const { ctx, app } = this;                               
      // 檢查balance key是否設定
      const isExist = await app.redis.exists('balance');
      if (!isExist) {
        // 取出資料庫的餘額
        let myBalance = await ctx.model.Transaction.findOne({
          attributes: ['balance'],
          order: [
            ['id', 'desc']
          ],
          limit: 1,
          offset: 0,
        });
        if (myBalance) {
          myBalance = Number(myBalance.balance.replace('$', ''));
          await app.redis.set('balance', myBalance);
        } else {
          await app.redis.set('balance', 0);
        }        
      }            
      // 取得存款金額
      let deposit = ctx.request.body.deposit;
      // 新增存款金額至餘額
      await app.redis.incrby('balance', deposit);      
      // 存款時間
      let depositTime = this.dateTime();
      depositTime.then(
        (result) => {
          depositTime = result;
        }
      );
      // 取得餘額
      const balance = await app.redis.get('balance');            
      // 存款金額格式
      const depositForm = '$' + Number(deposit).toFixed(2); 
      const balanceForm = '$' + Number(balance).toFixed(2); 
      // 取得末寫入交易明細至List的列表長度
      const lLen = await app.redis.llen('times');
      ctx.session.lLen = lLen;
      // 存入列表用做交易明細
      await app.redis.rpush('times', depositTime);
      await app.redis.rpush('deposit', depositForm);
      await app.redis.rpush('withdraw', '');
      await app.redis.rpush('balances', balanceForm);
      ctx.redirect('/');
    }
    // 存提款時間格式
    async dateTime() {
      let createdAt = new Date();
      const year = createdAt.getFullYear();
      const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
      const day = createdAt.getDate().toString().padStart(2, '0');
      const hour = createdAt.getHours();
      const minute = createdAt.getMinutes();
      let second = createdAt.getSeconds();
      const msecond = createdAt.getMilliseconds();
      const usecond = msecond * 1000;
      second = Number(second + '.' + usecond).toFixed(3);
      createdAt = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;      
      return createdAt;
    }
  };
};
