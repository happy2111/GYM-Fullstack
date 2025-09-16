import api from '../http';

class VisitService {
  async generateQR() {
    const response = await api.get('/visits/qr');
    return response.data;
  }

  async scanQR(qrCode , note = null) {
    const response = await api.post('/visits/scan', { qrCode, note });
    return response.data;
  }
}

const visitService = new VisitService();
export default visitService;