import api from '../http/index.js';

class MembershipService {
  async getActiveMembership(userId) {
    const response = await api.get(`/memberships/user/${userId}/active`);
    return response.data.memberships;
  }
  async getAllMemberships() {
    const response = await api.get('/memberships/me/all');
    return response.data;
  }

}

const membershipService = new MembershipService();
export default membershipService;