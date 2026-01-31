# Deploy and Publish Automation

自动化部署发布流程工具，使用 Playwright 自动化：
1. 创建 GitHub 仓库
2. Supabase OAuth 授权
3. Vercel OAuth 授权

## 功能特性

- 自动创建 GitHub 私人/公开仓库
- 自动完成 Supabase OAuth 授权
- 自动完成 Vercel OAuth 授权
- 支持环境变量配置
- 可视化浏览器操作（headless mode: false）

## 安装

```bash
# 克隆或进入项目目录
cd agent-bot

# 安装依赖
npm install
```

## 配置

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# GitHub 凭证
GITHUB_EMAIL=451418817@qq.com
GITHUB_PASSWORD=your-password

# 仓库配置
REPO_NAME=agentbotpm
IS_PRIVATE=true
```

## 使用方法

### 快速开始

```bash
npm run deploy
```

### 单独步骤

#### 1. 仅创建 GitHub 仓库

```bash
npm run create-repo
```

#### 2. 仅 Supabase 授权

```bash
npm run auth-supabase
```

#### 3. 仅 Vercel 授权

```bash
npm run auth-vercel
```

### 自定义参数

```bash
REPO_NAME=my-awesome-project IS_PRIVATE=false npm run deploy
```

## 项目结构

```
agent-bot/
├── .claude/
│   └── skills/
│       └── deploy-and-publish/
│           ├── skill.json       # Skill 配置
│           └── prompt.md        # Skill 提示词文档
├── scripts/
│   ├── create-repo.js           # 创建仓库脚本
│   ├── auth-supabase.js         # Supabase 授权脚本
│   ├── auth-vercel.js           # Vercel 授权脚本
│   └── deploy-complete.js       # 完整部署脚本
├── .env.example                 # 环境变量示例
├── package.json
└── README.md
```

## 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run deploy` | 执行完整部署流程 |
| `npm run create-repo` | 仅创建 GitHub 仓库 |
| `npm run auth-supabase` | 仅 Supabase 授权 |
| `npm run auth-vercel` | 仅 Vercel 授权 |

## GitHub OAuth 选择器参考

| 元素 | 选择器 |
|------|--------|
| 邮箱输入框 | `#login_field` |
| 密码输入框 | `#password` |
| 提交按钮 | `input[type="submit"]` |
| 仓库名输入 | `#repository-name-input` |
| 私有选项 | `input[value="private"]` |
| 创建按钮 | `button[type="submit"]` (包含 "Create" 文本) |
| 授权按钮 | `button[type="submit"]` (包含 "Authorize" 文本) |

## 注意事项

### 安全建议

1. **不要在代码中硬编码密码**
2. 使用环境变量存储敏感信息
3. 考虑使用 GitHub Personal Access Token 代替密码
4. 不要将 `.env` 文件提交到版本控制

### 可能遇到的问题

#### 2FA 双因素认证

如果账号启用了 2FA，需要额外处理验证码输入。

#### 验证码/人机验证

GitHub 可能会显示 CAPTCHA，需要手动处理。

#### 会话超时

长时间运行可能需要重新登录。

### 故障排除

#### 登录失败

- 检查邮箱和密码是否正确
- 确认账号没有启用 2FA
- 使用 `headless: false` 查看浏览器操作

#### 仓库创建失败

- 检查仓库名称是否已被占用
- 确认账号有创建仓库的权限
- 增加等待时间（网络较慢时）

#### OAuth 授权失败

- 检查 state 参数是否正确
- 确认 OAuth 应用未过期
- 检查是否已经授权过（可能跳过授权页面）

## 开发

### 作为 Claude Code Skill 使用

这个项目可以作为 Claude Code 的 skill 使用：

```bash
# Skill 目录
.claude/skills/deploy-and-publish/
```

包含：
- `skill.json` - Skill 元数据和参数定义
- `prompt.md` - 完整的使用说明和代码示例

### 扩展功能

可以添加更多平台支持：

```javascript
// 示例：添加 Netlify 支持
async function authorizeNetlify(page, state) {
  const netlifyUrl = `https://github.com/login?client_id=...&state=${state}`;
  await page.goto(netlifyUrl);
  // ... 授权逻辑
}
```

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

Claude Code

## 更新日志

### v1.0.0 (2025-01-31)

- 初始版本
- 支持 GitHub 仓库创建
- 支持 Supabase OAuth 授权
- 支持 Vercel OAuth 授权
- 完整的 Claude Code Skill 集成
