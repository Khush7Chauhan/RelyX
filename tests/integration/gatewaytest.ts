import { describe, it, expect, beforeAll } from 'vitest';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import util from 'util';

const PROTO_DIR = path.resolve(__dirname, '../../proto');
const userPackageDef = protoLoader.loadSync(path.join(PROTO_DIR, 'user/user.proto'));
const userProto = (grpc.loadPackageDefinition(userPackageDef) as any).relayx.user.v1;

describe('Gateway Integration: User Service', () => {
  let createUser: any;

  beforeAll(() => {
    const client = new userProto.UserService(
      'localhost:5000', 
      grpc.credentials.createInsecure()
    );
    createUser = util.promisify(client.CreateUser).bind(client);
  });

  it('should successfully route a CreateUser request through the gateway', async () => {
    const response = await createUser({ 
      username: 'Khush7Chauhan', 
      email: 'khush@test.local' 
    });
    
    expect(response).toBeDefined();
    expect(response.username).toBe('Khush7Chauhan');
    expect(response.user_id).toBeDefined();
  });
});