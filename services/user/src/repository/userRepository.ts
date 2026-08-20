export class userRepository {
    private db = new Map<string,any>();

    public async findById(id: string){
        return this.db.get(id) || null;
    }

    public async create(user: any){
        this.db.set(user.user_id, user);
        return user;
    }
}