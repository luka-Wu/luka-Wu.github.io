# 留言评论服务配置

网站使用 Supabase 保存留言。前端仅使用公开的 `anon key`，权限由数据库的 RLS 与受限 RPC 控制。

## 1. 创建 Supabase 项目

1. 登录 [Supabase](https://supabase.com/) 并创建免费项目。
2. 打开项目的 SQL Editor。
3. 复制并执行 [`supabase/comments.sql`](../supabase/comments.sql) 的全部内容。

脚本会创建评论表、公开读取策略和受限提交函数。访客只能读取已公开评论和提交新评论，不能修改或删除数据。

## 2. 获取公开配置

在 Supabase 项目的 `Settings → API` 中找到：

- Project URL
- `anon` public key

本地开发时，复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

然后填写：

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

不要把 `service_role key` 放入前端、GitHub Secrets 或仓库。

## 3. 配置 GitHub Pages

在 GitHub 仓库中打开 `Settings → Secrets and variables → Actions`，新增两个 Repository secrets：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

推送到 `main` 后，GitHub Actions 会在构建阶段注入配置并部署留言功能。

## 4. 隐藏不合适的留言

留言默认立即公开。如需隐藏某条留言，可在 Supabase Table Editor 中将该行的 `approved` 改为 `false`。

公开页面只会读取 `approved = true` 的留言。

## 5. 基础防刷说明

当前版本包含字数限制、蜜罐字段、浏览器提交冷却和数据库重复内容拦截，适合个人网站的基础防刷。若后续出现持续恶意提交，应增加 Cloudflare Turnstile 或改为审核后公开。
