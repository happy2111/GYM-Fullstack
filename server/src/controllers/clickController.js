const logger = require('../utils/logger');
const clickService = require("../services/clickService");
const tariffService = require("../services/tariffService");
const authService = require("../services/authService");
const paymentService = require("../services/paymentService");
class ClickController {
  async prepare(req, res) {
    try {
      const result = await clickService.prepare(req.body);
      res.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      res.send(result);
    } catch (e) {
      logger.error('Click prepare error:', e);
      res.status(500).send({ error: -9, error_note: 'Internal error' });
    }
  }

  async complete(req, res) {
    try {
      const result = await clickService.complete(req.body);
      res.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      res.send(result);
    } catch (e) {
      logger.error('Click complete error:', e);
      res.status(500).send({ error: -9, error_note: 'Internal error' });
    }
  }
  async checkout(req, res, nex) {
    try{
      const CurrentUser = req.user
      const {productId, url} = req.body

      const MERCHANT_ID = process.env.CLICK_MERCHANT_ID
      const SERVICE_ID = process.env.CLICK_SERVICE_ID
      const MERCHANT_USER_ID = process.env.CLICK_MERCHANT_USER_ID

      const product = await tariffService.getTariffById(productId)
      if (!product) {
        return res.status(404).json({error: 'Product not found'})
      }


      const user = await authService.findUserById(CurrentUser.id)
      if (!user) {
        return res.status(404).json({error: 'User not found'})
      }
      const payment = await paymentService.createPayment({
        userId: CurrentUser.id,
        amount: product.price,
        method: 'click',
        transactionId: null,        // пока нет
        tariffId: product.id,
        membershipId: null,
        merchant_prepare_id: null,  // пока тоже нет
      });

      const checkoutURL =
        `https://my.click.uz/services/pay?service_id=${SERVICE_ID}&merchant_id=${MERCHANT_ID}&amount=${product.price}&transaction_param=${payment.id}&return_url=${url}`

      res.status(200).json({url: checkoutURL})
    }catch (e) {
      logger.error(e);
    }
  }
}

module.exports = new ClickController();