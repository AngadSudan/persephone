export interface RedisClientInterface {
  client: any;
  url: string;
  isConnected: boolean | null;
  password: string;
  createClient: () => Promise<void>;
  connectToClient: () => Promise<void>;
  setCache: (key: string, message: any) => Promise<void>;
  getCache: (key: string) => Promise<any>;
}
