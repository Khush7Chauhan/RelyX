import * as grpc from '@grpc/grpc-js';
import { UserService } from '../service/userService';

export class UserHandler {
  constructor(private userService: UserService) {}

  public GetUser = async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) => {
    try {
      const user = await this.userService.getUser(call.request.user_id);
      if (!user) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Not found' }, null);
      }
      callback(null, user);
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Internal error' }, null);
    }
  };
}