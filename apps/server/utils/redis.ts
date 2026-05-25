const cacheClient = {
  async createClient(): Promise<void> {},
  async connectToClient(): Promise<void> {},
  async clearAllCache(): Promise<void> {},
  async getCache(_key: string): Promise<null> {
    return null;
  },
  async setCache(_key: string, _value: unknown): Promise<void> {},
  async invalidateCache(_key: string): Promise<void> {},
  async checkInBF(_value: string): Promise<boolean> {
    return false;
  },
};

export default cacheClient;
