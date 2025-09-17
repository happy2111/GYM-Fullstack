const { ClickError , ClickAction, TransactionState} = require("../enum/transaction.enum");
const paymentService = require("./paymentService");
const clickCheckToken = require("../utils/click");
const authService = require("./authService");
const tariffService = require("./tariffService");
const membershipService = require("./membershipService");
const { v4: uuidv4 } = require('uuid');
const logger = require("../utils/logger");
class ClickService {

  async prepare(data) {
    const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = data

    const payment = await paymentService.getPaymentById(merchant_trans_id);

    if (!payment) {
      return { error: ClickError.TransactionNotFound, error_note: 'Transaction not found' }
    }

    const userId = payment.user_id
    const productId = payment.tariff_id
    const paymentId = payment.id

    const signatureData = { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time }


    const checkSignature = clickCheckToken(signatureData, sign_string)
    if (!checkSignature) {
      return { error: ClickError.SignFailed, error_note: 'Invalid sign' }
    }

    if (parseInt(action) !== ClickAction.Prepare) {
      return { error: ClickError.ActionNotFound, error_note: 'Action not found' }
    }

    const isAlreadyPaid = await paymentService.findPaidPayment(payment.user_id, payment.tariff_id, 'click');

    if (isAlreadyPaid) {
      return { error: ClickError.AlreadyPaid, error_note: 'Already paid' }
    }

    const user = await authService.findUserById(userId)
    if (!user) {
      return { error: ClickError.UserNotFound, error_note: 'User not found' }
    }

    const product = await tariffService.getTariffById(productId);
    if (!product) {
      return { error: ClickError.BadRequest, error_note: 'Product not found' };
    }

    if (parseInt(amount) !== parseInt(product.price)) {
      return { error: ClickError.InvalidAmount, error_note: 'Incorrect parameter amount' };
    }

    const transaction = await paymentService.findByTransactionId(click_trans_id);
    if (transaction && transaction.status === TransactionState.PendingCanceled) {
      return { error: ClickError.TransactionCanceled, error_note: 'Transaction canceled' };
    }


    const prepareId = Date.now();
    await paymentService.updatePrepare(payment.id, click_trans_id, prepareId);

    return {
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: prepareId,  // возвращаем то, что сохранили
      error: ClickError.Success,
      error_note: 'Success',
    }


  }


  async complete(data) {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      action,
      sign_time,
      sign_string,
      error,
    } = data;

    // 1. Находим платёж
    const payment = await paymentService.getPaymentById(merchant_trans_id);
    if (!payment) {
      return { error: ClickError.TransactionNotFound, error_note: 'Payment not found' };
    }

    // 2. Проверяем подпись
    const signatureData = {
      click_trans_id,
      service_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      action,
      sign_time,
    };

    const checkSignature = clickCheckToken(signatureData, sign_string);
    if (!checkSignature) {
      return { error: ClickError.SignFailed, error_note: 'Invalid sign' };
    }

    // 3. Проверяем action
    if (parseInt(action) !== ClickAction.Complete) {
      return { error: ClickError.ActionNotFound, error_note: 'Action not found' };
    }

    const user = await authService.findUserById(payment.user_id);
    if  (!user) {
      return { error: ClickError.UserNotFound, error_note: 'User not found' };
    }

    const product = await tariffService.getTariffById(payment.tariff_id);
    if (!product) {
      return { error: ClickError.BadRequest, error_note: 'Product not found' };
    }

    const isPrepared = await paymentService.findByPrepareId(merchant_prepare_id, 'click');

    if (!isPrepared) {
      return { error: ClickError.TransactionNotFound, error_note: 'Transaction not found' };
    }

    const isAlreadyPaid = await paymentService.findPaidPayment(payment.user_id, payment.tariff_id, 'click');
    if (isAlreadyPaid) {
      return { error: ClickError.AlreadyPaid, error_note: 'Already paid' };
    }

    if (parseInt(amount) !== parseInt(product.price)) {
      return { error: ClickError.InvalidAmount, error_note: 'Incorrect parameter amount' };
    }

    const transaction = await paymentService.findByTransactionId(click_trans_id);
    if (transaction && transaction.status === TransactionState.PendingCanceled) {
      return { error: ClickError.TransactionCanceled, error_note: 'Transaction canceled' };
    }

    if (parseInt(error) < 0) {
        await paymentService.updateStatus(payment.id, 'failed', click_trans_id);
        return { error: ClickError.TransactionCanceled, error_note: 'Transaction canceled' };
    }

    // 4. Проверяем статус и сумму
    if (payment.status === TransactionState.Paid) {
      return { error: ClickError.AlreadyPaid, error_note: 'Already paid' };
    }
    if (parseFloat(amount) !== parseFloat(payment.amount)) {
      return { error: ClickError.InvalidAmount, error_note: 'Incorrect amount' };
    }

    // 5. Завершаем платёж
    await paymentService.updateStatus(payment.id, 'completed', click_trans_id);

    // TODO: здесь создаём membership
    const startDate = new Date();
    let endDate = null;
    let maxVisits = null;

    if (product.duration_days) {
      endDate = new Date(startDate.getTime() + product.duration_days * 24 * 60 * 60 * 1000);
    }

    if (product.max_visits) {
      maxVisits = product.max_visits;
    }

    try {
      await membershipService.createMembership({
        userId: payment.user_id,
        startDate,
        endDate,
        maxVisits,
        paymentId: payment.id,
        tariffId: payment.tariff_id,
      })
    }catch (err) {
      logger.error('Create membership error:', err);
    }



    return {
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: merchant_prepare_id,
      error: ClickError.Success,
      error_note: 'Success',
    };

  }

}
module.exports = new ClickService();