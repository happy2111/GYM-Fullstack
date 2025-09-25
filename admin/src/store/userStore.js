import usersService from "@/services/usersService.js";
import { makeAutoObservable, runInAction } from 'mobx';



class UserStore {
  users = [];
  isLoading = false;
  error = null;

  constructor( ) {
    makeAutoObservable(this);
  }

  async fetchAllUsers() {
        try {
            const data = await usersService.getAllUsers();
            runInAction(() => {
              this.user = data;
              this.isLoading = false;
            })
        }catch (err) {
          runInAction(() => {
            this.error = err.message;
            this.isLoading = false;
          })
        }
  }


}

export default new UserStore()