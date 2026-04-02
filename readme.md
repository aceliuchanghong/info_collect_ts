## 汇总全球热门购买产品的排名

基于 TypeScript 的畅销产品信息收集程序，支持多平台数据采集并通过大模型生成 Markdown 文档。

### 项目结构

```
src/
├── index.ts            # 主入口
├── config/
│   └── index.ts        # 配置管理（dotenv + zod）
├── collectors/
│   ├── base.ts         # 采集器基类
│   ├── amazon.ts       # Amazon 采集器示例
│   └── index.ts        # 采集器导出
├── models/
│   └── product.ts      # 产品数据模型
├── services/
│   ├── llm.ts          # 大模型服务
│   └── storage.ts      # 文件存储服务
├── utils/
│   └── http.ts         # HTTP 请求工具
└── types/
    └── index.ts        # 类型定义
```

```
┌─────────────────────────────────────────────────────┐
│                    入口 (index.ts)                   │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   Collectors     │    │    Config        │
│  (数据采集层)     │    │   (配置管理)      │
└────────┬─────────┘    └──────────────────┘
         │
         ▼
┌──────────────────┐
│   Models         │
│  (数据模型/存储)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  LLM Service     │
│  (大模型生成 MD) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Output         │
│  (MD 文档输出)    │
└──────────────────┘
```

### 快速开始

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 生产模式运行
npm start

"scripts": {
  "start": "...",      // npm start ✓
  "test": "...",       // npm test ✓
  "dev": "...",        // npm run dev ✓ (npm dev ✗)
  "build": "...",      // npm run build ✓
  "lint": "...",       // npm run lint ✓
  "my-custom": "..."   // npm run my-custom ✓
}
```

### 扩展采集器

在 `src/collectors/` 目录下创建新的采集器类，继承 `BaseCollector` 即可。

