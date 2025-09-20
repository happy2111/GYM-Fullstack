import api from '../http/index.js';

class MembershipService {
  async getAllMemberships() {
    const response = await api.get('/memberships/me/all');
    return response.data;
  }
}

const membershipService = new MembershipService();
export default membershipService;