import { userRepository } from "../repository/userRepository";

export class UserService {
    constructor(private repo: userRepository) {}
    public async getUser(id:string){
        return this.repo.findById(id);
    }

    public async createUser(username: string, email: string) {
        const user ={
            user_id:Math.random().toString(36).substring(7),
            username,
            email,
            created_at: new Date().toISOString(),
        };
        return this.repo.create(user);
    }
}