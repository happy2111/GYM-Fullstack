import { makeAutoObservable, runInAction } from 'mobx';
import paymentService from "@/services/paymentService.js";
import usersService from "@/services/usersService.js";
import visitService from "@/services/visitService.js";
import membershipService from "@/services/membershipService.js";

class DashboardStore {
  paymentStats = {};
  membershipStats = {};
  visitStats = {};
  userStats = {};
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPaymentStats() {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await paymentService.getPaymentStats();
      runInAction(() => {
        this.paymentStats = data || {};
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
    }
  }

  async fetchUserStats() {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await usersService.getUserStats();

        runInAction(() => {
          this.userStats = data || {};
          this.isLoading = false;
        });
    }catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
    }
  }

  async fetchVisitStats() {
    this.isLoading = true
    this.error = null
    try {
      const data = await visitService.getDashboardStats()
      runInAction(() => {
        this.visitStats = data?.stats || {};
        this.isLoading = false;
      });
    }catch (error) {
      console.error(error)
    }
  }

  async fetchMembershipStats() {
    this.isLoading = true;
    this.error = null
    try {
      const data = await membershipService.getStats()
      runInAction(() => {
        this.membershipStats = data?.data || {};
        this.isLoading = false;
      })
    }catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
    }
  }
}

export default new DashboardStore();
