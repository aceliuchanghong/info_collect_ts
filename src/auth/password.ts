import bcrypt from 'bcrypt';

/**
 * 密码哈希工具类
 * 使用 bcrypt 进行安全的密码哈希和验证
 */
export class PasswordHasher {
  private rounds: number;

  /**
   * 创建密码哈希器实例
   * @param rounds - bcrypt 轮数，默认 12
   */
  constructor(rounds: number = 12) {
    this.rounds = rounds;
  }

  /**
   * 哈希密码
   * @param password - 明文密码
   * @returns 哈希后的密码
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  /**
   * 验证密码
   * @param password - 明文密码
   * @param hash - 哈希密码
   * @returns 是否匹配
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 检查哈希是否需要更新（轮数变化时）
   * @param hash 现有哈希
   * @returns 是否需要重新哈希
   */
  needsRehash(hash: string): boolean {
    const roundsFromHash = this.extractRounds(hash);
    return roundsFromHash !== this.rounds;
  }

  /**
   * 从哈希中提取轮数
   * @param hash bcrypt 哈希字符串
   * @returns 轮数
   */
  private extractRounds(hash: string): number {
    const match = hash.match(/^\$2[aby]?\$(\d+)\$/);
    return match ? parseInt(match[1], 10) : 0;
  }
}