# 留言、照片墙与图片上传配置

网站使用 Supabase 保存留言和兴趣照片，并使用 Supabase Storage 存放图片。前端仅使用公开的 `anon key`，权限由数据库 RLS、Storage policy 与受限 RPC 控制。

## 1. 创建 Supabase 项目

1. 登录 [Supabase](https://supabase.com/) 并创建免费项目。
2. 打开项目的 SQL Editor。
3. 复制并执行 [`supabase/comments.sql`](../supabase/comments.sql) 的全部内容。
4. 复制并执行 [`supabase/media.sql`](../supabase/media.sql) 的全部内容。

脚本会创建评论表、照片墙表、`guestbook-media` Storage bucket，以及对应的权限策略：

- 访客可以提交留言，也可以向 `wall/` 投稿一张待审核照片。
- 未审核照片不会出现在公开查询结果中；访客不能修改、通过或删除照片。
- 只有邮箱为 `wuyy.77@qq.com` 的 Supabase Auth 用户可以审核、发布和删除照片墙记录。

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
NEXT_PUBLIC_SITE_ADMIN_EMAIL=wuyy.77@qq.com
```

不要把 `service_role key` 放入前端、GitHub Secrets 或仓库。

## 3. 配置本人 Magic Link 登录

打开 Supabase 的 `Authentication → URL Configuration`：

- `Site URL` 设置为 `https://luka-wu.github.io/`
- `Redirect URLs` 加入 `https://luka-wu.github.io/guestbook/`
- 本地调试时再加入 `http://localhost:3000/guestbook/`

打开 `Authentication → Providers → Email`，确认 Email provider 和 Magic Link 可用。“审核登录”入口会将登录链接发送到 `wuyy.77@qq.com`；不要在前端保存密码或 `service_role key`。

## 4. 配置 GitHub Pages

在 GitHub 仓库中打开 `Settings → Secrets and variables → Actions`，新增两个 Repository secrets：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

管理员邮箱默认使用 `wuyy.77@qq.com`。如需更换，可新增 Repository variable `NEXT_PUBLIC_SITE_ADMIN_EMAIL`，并同步修改 [`supabase/media.sql`](../supabase/media.sql) 中的管理员邮箱后重新执行脚本。

推送到 `main` 后，GitHub Actions 会在构建阶段注入配置并部署留言、照片墙和图片上传功能。

## 5. 使用照片墙

进入 `/guestbook/` 并点击“上传照片”，任何访客都可以填写标题、分类、说明和拍摄日期后投稿。投稿不会立即公开，审核通过后才会显示在照片墙。

站点本人点击“审核登录”，通过 Magic Link 登录后可以查看“待审核”分类，并执行：

- 通过投稿并公开展示。
- 拒绝投稿并删除对应图片。
- 删除已经公开的照片。

图片在浏览器端缩放并重新编码为 WebP，因此 EXIF 和定位信息不会写入上传文件。单张原图和处理后的文件均不能超过 3MB。

## 6. 隐藏不合适的留言

留言默认立即公开。如需隐藏某条留言，可在 Supabase Table Editor 中将该行的 `approved` 改为 `false`。

公开页面只会读取 `approved = true` 的留言。

## 7. 基础防刷说明

当前版本包含字数限制、蜜罐字段、浏览器提交冷却和数据库重复内容拦截，适合个人网站的基础防刷。若后续出现持续恶意提交，应增加 Cloudflare Turnstile 或改为审核后公开。
