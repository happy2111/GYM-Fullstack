import api from '../http';

class PaymentService {
  async getAllPayments() {
    const response = await api.get('/payment/get-payments');
    return response.data;
  }

  async confirmPayment(paymentId) {
    const response = await api.post(`/payment/confirm/${paymentId}`);
    return response.data;
  }

  async getPaymentStats() {
    const response = await api.get('/payment/stats');
    return response.data;
  }

  async deletePayment(paymentId) {
    const response = await api.delete(`/payment/${paymentId}`);
    return response.data;
  }

}

const paymentService = new PaymentService();
export default paymentService;