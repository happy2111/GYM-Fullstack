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
}

const paymentService = new PaymentService();
export default paymentService;