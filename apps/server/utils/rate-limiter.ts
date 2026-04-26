export class TokenBucketRateLimiter {
  private tokens: number;
  private readonly capacity: number;
  private readonly fillRate: number; // tokens per ms
  private lastRefill: number;

  constructor(
    requestsPerMinute: number,
    burstCapacity?: number,
  ) {
    this.capacity   = burstCapacity ?? requestsPerMinute;
    this.tokens     = this.capacity;
    this.fillRate   = requestsPerMinute / 60_000; // per ms
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate how long to wait for the next token
    const msUntilToken = Math.ceil((1 - this.tokens) / this.fillRate);
    await new Promise((resolve) => setTimeout(resolve, msUntilToken));

    this.refill();
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.fillRate);
    this.lastRefill = now;
  }
}

// ── Singleton: 12 RPM to stay safely under Gemini free limit ──
export const geminiRateLimiter = new TokenBucketRateLimiter(12, 5);