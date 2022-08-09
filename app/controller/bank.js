'use strict';

const { ajax } = require('jquery');

const Controller = require('egg').Controller;

module.exports = app => {
  return class BankController extends app.Controller {
    async index() {
      const { ctx, app } = this;            
      const ls_len = await app.redis.llen('balances');
      const ls_time = await app.redis.lrange('times', 0, -1);
      let ls_withdraw = await app.redis.lrange('withdraw', 0, -1);
      let ls_deposit = await app.redis.lrange('deposit', 0, -1);  
      let ls_balance = await app.redis.lrange('balances', 0, -1);
      let arrs = [];
      for(let i = 0; i < ls_len; i++){
        // 取出Redis的列表後存入陣列
        arrs.push(
          {
            'time': ls_time[i],
            'withdraw': ls_withdraw[i],
            'deposit': ls_deposit[i],
            'balance': '$' + Number(ls_balance[i]).toFixed(2),
          }
        );        
      }
      await ctx.render('index.html', {
        arrs: arrs,
      });
    }
    // 提款
    async withdraw() {
      const { ctx, app } = this;
      // 取得餘額
      let balance = await app.redis.get('balance');
      // 取得提款金額
      let withdraw = ctx.request.body.withdraw;
      // 提款金額若大於餘額，則無法取款
      if(Number(withdraw) > Number(balance)){
        // const err = '餘額不足，無法提款';
        ctx.redirect('/');
      }else{
        // 從餘額減去提款金額
        await app.redis.decrby('balance', withdraw);
        // 提款時間       
        let withdraw_time = this.dateTime();
        withdraw_time.then(
          (result) => {
            withdraw_time = result;
          }
        );
        balance = await app.redis.get('balance');
        ctx.session.balance = balance;
        withdraw = '$' + Number(withdraw).toFixed(2);
        // 存入列表用做交易明細
        await app.redis.lpush('times', withdraw_time);
        await app.redis.lpush('deposit', '');
        await app.redis.lpush('withdraw', withdraw);
        await app.redis.lpush('balances', balance);
        ctx.redirect('/');
      }
    }
    // 存款
    async deposit() {
      const { ctx, app } = this;
      // 檢查餘額是否設定
      const isBuild = await app.redis.exists('balance');
      if(!isBuild){
        await app.redis.set('balance', 0);
      }
      // 取得存款金額
      let deposit = ctx.request.body.deposit;
      // 新增存款金額至餘額
      await app.redis.incrby('balance', deposit);      
      // 存款時間
      let deposit_time = this.dateTime();
      deposit_time.then(
        (result) => {
          deposit_time = result;
        }
      );
      // 取得餘額
      const balance = await app.redis.get('balance');  
      ctx.session.balance = balance;   
      deposit = '$' + Number(deposit).toFixed(2); 
      // 存入列表用做交易明細
      await app.redis.lpush('times', deposit_time);
      await app.redis.lpush('deposit', deposit);
      await app.redis.lpush('withdraw', '');
      await app.redis.lpush('balances', balance);
      ctx.redirect('/');      
    }
    // 存提款時間格式
    async dateTime() {
      let created_at = new Date();
      const year = created_at.getFullYear();
      const month = (created_at.getMonth() + 1).toString().padStart(2, '0');
      const day = created_at.getDate().toString().padStart(2, '0');
      const hour = created_at.getHours();
      const minute = created_at.getMinutes();
      let second = created_at.getSeconds();
      const msecond = created_at.getMilliseconds();
      const usecond = msecond * 1000;
      second = Number(second + '.' + usecond).toFixed(3);
      created_at = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;      
      return created_at;
    }
  };
};
