import { makeAutoObservable, runInAction } from 'mobx';
import membershipService from "../services/membershipService.js";
import { toJS } from "mobx";


class MembershipStore {
  memberships = []
  isLoading = false;
  acitiveMemberships = [];
  error = null;

  constructor() {
    makeAutoObservable(this);
  }


  async getAllMemberships() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await membershipService.getAllMemberships();

      runInAction(() => {
        // сначала очищаем массив активных абонементов
        this.acitiveMemberships = [];

        response.forEach(membership => {
          if (membership.status === 'active') {
            this.acitiveMemberships.push(membership);
          }
        });

        this.memberships = response;
        this.isLoading = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      })
    }
  }
}

const membershipStore = new MembershipStore();
export default membershipStore;
