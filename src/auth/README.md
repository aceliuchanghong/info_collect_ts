# 认证模块

独立、可复用的登录注册组件，支持快速集成到任意 TypeScript 项目。

## 特性

- 自包含，不依赖项目其他模块
- 支持环境变量和手动配置两种方式
- 完整类型定义
- Zod 配置验证
- bcrypt 密码哈希
- JWT 无状态令牌
- 密码重置支持
- 可插拔的存储层设计

## 安装依赖

```bash
npm install bcrypt jsonwebtoken uuid zod
npm install -D @types/bcrypt @types/jsonwebtoken
```

## 环境变量

```env
JWT_SECRET=your-secret-key-at-least-16-chars  # 必填：JWT 密钥（至少 16 字符）
JWT_EXPIRES_IN=7d                              # 可选：令牌过期时间，默认 7d
JWT_ISSUER=your-app-name                       # 可选：令牌签发者
BCRYPT_ROUNDS=12                               # 可选：密码哈希轮数，默认 12
```

## 快速开始

### 1. 实现用户存储

认证模块通过 `UserStorage` 接口与数据库解耦，你需要实现这个接口：

```typescript
import type { User, UserStorage } from './auth/index.js';

// 以数据库为例（可使用 Prisma、MongoDB、PostgreSQL 等）
class DatabaseUserStorage implements UserStorage {
  async findByEmail(email: string): Promise<User | null> {
    const user = await db.users.findUnique({ where: { email } });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await db.users.findUnique({ where: { id } });
    return user;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await db.users.create({
      data: {
        id: generateId(),
        email: userData.email,
        username: userData.username,
        passwordHash: userData.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await db.users.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
    });
    return user;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await db.users.count({ where: { email } });
    return count > 0;
  }
}
```

### 2. 使用环境变量配置

```typescript
import { AuthService } from './auth/index.js';

const userStorage = new DatabaseUserStorage();
const auth = new AuthService(userStorage); // 自动从 process.env 读取配置
```

### 3. 手动配置

```typescript
import { AuthService, createAuthConfig } from './auth/index.js';

const config = createAuthConfig({
  JWT_SECRET: 'your-secret-key-at-least-16-chars',
  JWT_EXPIRES_IN: '24h',
});

const auth = new AuthService(userStorage, config);
```

## API 示例

### 用户注册

```typescript
const result = await auth.register({
  email: 'user@example.com',
  password: 'secure-password-123',
  username: 'john_doe', // 可选
});

console.log(result.user);  // { id, email, username, createdAt }
console.log(result.token); // JWT 令牌
```

### 用户登录

```typescript
const result = await auth.login({
  email: 'user@example.com',
  password: 'secure-password-123',
});

console.log(result.user);  // 用户信息
console.log(result.token); // JWT 令牌
```

### 验证令牌

```typescript
const result = await auth.verifyToken(token);

if (result.valid) {
  console.log(result.user); // 用户信息
} else {
  console.log(result.error); // 错误信息
}
```

### 从请求头验证

```typescript
// Express 中间件示例
import express from 'express';

const app = express();

app.get('/protected', async (req, res) => {
  const authHeader = req.headers.authorization;
  const result = await auth.verifyFromHeader(authHeader);

  if (!result.valid) {
    res.status(401).json({ error: result.error });
    return;
  }

  res.json({ user: result.user });
});
```

### 密码重置

```typescript
// 请求密码重置
const { resetToken } = await auth.requestPasswordReset({
  email: 'user@example.com',
});

// 实际项目中，将 resetToken 通过邮件发送给用户
// sendResetEmail(email, resetToken);

// 用户点击链接后，使用令牌重置密码
await auth.resetPassword({
  resetToken,
  newPassword: 'new-secure-password',
});
```

### 单独使用密码哈希

```typescript
import { PasswordHasher } from './auth/index.js';

const hasher = new PasswordHasher(12); // 轮数，默认 12

// 哈希密码
const hash = await hasher.hash('password123');

// 验证密码
const isValid = await hasher.verify('password123', hash);

// 检查是否需要重新哈希
if (hasher.needsRehash(hash)) {
  const newHash = await hasher.hash('password123');
  // 更新存储的哈希
}
```

### 单独使用 JWT

```typescript
import { JwtService } from './auth/index.js';

const jwt = new JwtService('your-secret-key', '7d', 'your-app');

// 生成令牌
const token = jwt.sign({ sub: 'user-id', email: 'user@example.com' });

// 验证令牌
const result = jwt.verify(token);
if (result.valid) {
  console.log(result.payload);
}

// 从请求头提取令牌
const token = jwt.extractFromHeader('Bearer xxx');
```

## Express 完整示例

```typescript
import express from 'express';
import { AuthService, type UserStorage, type User } from './auth/index.js';

// 实现存储层
class MemoryUserStorage implements UserStorage {
  private users = new Map<string, User>();

  async findByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string) {
    return this.users.get(id) || null;
  }

  async create(data) {
    const user: User = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, updates) {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates, { updatedAt: new Date() });
    return user;
  }

  async existsByEmail(email: string) {
    return !!(await this.findByEmail(email));
  }
}

// 创建服务
const storage = new MemoryUserStorage();
const auth = new AuthService(storage);

// 创建 Express 应用
const app = express();
app.use(express.json());

// 注册
app.post('/register', async (req, res) => {
  try {
    const result = await auth.register(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Registration failed' });
  }
});

// 登录
app.post('/login', async (req, res) => {
  try {
    const result = await auth.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Login failed' });
  }
});

// 受保护路由
app.get('/me', async (req, res) => {
  const result = await auth.verifyFromHeader(req.headers.authorization);
  if (!result.valid) {
    res.status(401).json({ error: result.error });
    return;
  }
  res.json(result.user);
});

app.listen(3000, () => console.log('Server running on :3000'));
```

## 复制到其他项目

1. 复制整个 `src/auth/` 目录
2. 安装依赖：`npm install bcrypt jsonwebtoken uuid zod && npm install -D @types/bcrypt @types/jsonwebtoken`
3. 配置环境变量或手动传入配置
4. 实现 `UserStorage` 接口连接你的数据库
5. 开始使用

## 类型导出

```typescript
import type {
  AuthConfig,
  User,
  UserInfo,
  RegisterParams,
  RegisterResult,
  LoginParams,
  LoginResult,
  JwtPayload,
  UserStorage,
  VerifyResult,
  RequestPasswordResetParams,
  RequestPasswordResetResult,
  ResetPasswordParams,
} from './auth/index.js';
```

## 安全建议

1. **JWT 密钥**：使用至少 32 字符的强随机密钥
2. **HTTPS**：始终在生产环境使用 HTTPS
3. **密码复杂度**：前端应验证密码复杂度后再提交
4. **速率限制**：对登录和注册端点实施速率限制
5. **令牌存储**：前端应使用 HttpOnly Cookie 或安全存储
6. **密码重置**：生产环境应通过邮件发送重置链接，而非直接返回令牌