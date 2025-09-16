import api from '../http';

class VisitService {
  async generateQR() {
    const response = await api.get('/visits/qr');
    return response.data;
  }
}

const visitService = new VisitService();
export default visitService;