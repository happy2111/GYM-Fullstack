import api from '../http';

class PaymentService {
  async getAllPayments() {
    const response = await api.get('/payment/get-payments');
    return response.data;
  }
}

const paymentService = new PaymentService();
export default paymentService;