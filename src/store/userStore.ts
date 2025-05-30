export type User = {
    email: string;
    password: string;
};
class UserStore{
    private user: User | null = null;
    private isLoggedIn: boolean = false;
    login(user: User) {
        this.user = user;
        this.isLoggedIn = true;
      
    }
    register(user: User) {
        this.user = user;
        this.isLoggedIn = true;
      
    }
    getUser()
    {
      this.getUser()
    }
    logout()
    {
        this.isLoggedIn=false;
    }
    getIsLoggedIn() 
    {
        return this.getIsLoggedIn;
    }
}
export default new UserStore()