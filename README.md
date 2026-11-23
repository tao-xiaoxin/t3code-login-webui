# T3 Code Login WebUI

为自托管的 [T3 Code](https://t3.codes/) 提供账号密码登录页。前端构建为静态文件；Node.js 网关管理会话，Nginx 验证会话并将请求转发到本机 T3 Code。此项目不是 T3 Code 官方项目。

![T3 Code 登录页面](login-page.png)

## AI 辅助部署

可以将以下提示词交给能访问目标服务器的 AI 助手。它会先检查现有环境，再按本文档部署；涉及生产配置时需人工确认，不会自动覆盖现有站点。

```text
请阅读 https://github.com/tao-xiaoxin/t3code-login-webui 的 README 和 deploy 目录，
在我的 Linux 服务器上部署 T3 Code 登录页。不要使用 Docker，也不要修改 T3 Code 上游代码。

先检查系统、Node.js、pnpm、Nginx 版本和模块、systemd、T3 Code 监听地址、
目标域名、TLS 证书以及现有站点配置。遇到缺失信息或生产配置冲突时先询问我，
不要覆盖已有配置、停止其他服务或暴露 T3 Code 的本机端口。

按 README 构建并运行测试，备份要修改的配置，向我说明改动及回滚方法，
获得确认后部署网关和 Nginx。密码、令牌、Cookie、私钥和私人目录不得写入
仓库、日志或回复；让我通过服务器上的私有环境文件设置凭据，不要让我在对话中粘贴。

完成后验证 Nginx 配置、服务状态、未登录跳转和 API 拒绝、正确及错误密码、
删除登录 Cookie 后重新登录，以及登录后 T3 Code 正常加载。报告实际结果和未验证项，
不要把构建成功当作登录验收通过。
```

## 安全边界

- 必须使用 HTTPS。登录 Cookie 带 `Secure`、`HttpOnly` 和 `SameSite=Strict`，HTTP 不能完成登录。
- T3 Code 上游令牌只保存在服务器私有环境文件，由网关注入上游请求，不发送给浏览器。
- 网关为单账号设计，会话仅保存在内存中；重启网关会使所有登录失效。空闲访问可续期，但不会超过最大有效期。
- 网关密码以环境变量明文保存，文件和进程环境须仅对受信任的管理员可读。不要将其用于共享主机、多人账户或替代经过审计的身份提供方。
- 此页面拥有 T3 Code 的上游权限。请使用强密码、严格保护服务器和 TLS 私钥，并在公网部署前自行审计。

## 环境要求

- Linux、systemd、Node.js 22.12 或更新版本、pnpm。
- Nginx 1.29.3 或更新版本，编译时启用 `http_auth_request_module`。`nginx -V` 可检查。
- 已安装的 T3 Code，监听 `127.0.0.1:3773`，以及一个有效的上游访问令牌。
- 指向服务器的域名与有效 TLS 证书。若使用 CDN，须避免缓存需要认证的响应和历史 404。

## 构建

```sh
pnpm install --frozen-lockfile
T3CODE_LOGIN_BASE=/login-assets/ pnpm build
node --test deploy/login-gateway.test.mjs
```

## 部署

以下步骤面向独立 Linux 服务器。先备份现有 Nginx 配置。不要覆盖已有同名站点，也不要暴露 T3 Code 的本机端口。

1. 复制构建产物和网关：

   ```sh
   sudo install -d /var/www/t3code-login/login-assets /opt/t3code-login /etc/nginx/t3code-secrets
   sudo cp -a dist/. /var/www/t3code-login/login-assets/
   sudo install -m 644 dist/index.html /var/www/t3code-login/index.html
   sudo install -m 644 dist/robots.txt /var/www/t3code-login/robots.txt
   sudo install -m 644 deploy/login-gateway.mjs /opt/t3code-login/login-gateway.mjs
   sudo install -m 644 deploy/gateway-upstream.inc deploy/t3code-login-nginx.inc /etc/nginx/t3code-secrets/
   ```

2. 创建私有环境文件：

   ```sh
   sudo install -m 600 deploy/gateway.env.example /etc/nginx/t3code-secrets/gateway.env
   sudo editor /etc/nginx/t3code-secrets/gateway.env
   ```

   填写自己的 HTTPS origin、用户名、强密码、随机 CSRF 值和 T3 Code 上游令牌。令牌必须是 T3 Code 实际签发且有效的令牌，不能使用随机占位值。不要把环境文件提交到 Git，也不要通过命令行参数或日志传递凭据。

3. 安装 `deploy/t3code-login-gateway.service`。将其中 `Group=nginx` 改为本机 Nginx worker 所在组，并确认 `ExecStart` 的 Node 路径正确：

   ```sh
   sudo install -m 644 deploy/t3code-login-gateway.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now t3code-login-gateway
   sudo systemctl status t3code-login-gateway --no-pager
   ```

4. 以 `deploy/t3code-site.conf.example` 为模板，在 Nginx 的 `http` 上下文中添加站点；将示例域名和证书路径换成自己的。若已有同名 `map`，应合并而不是重复定义。检查后再加载：

   ```sh
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. 在浏览器访问自己的 `/login`。未登录访问 `/` 应跳到登录页，未登录的 `/api/auth/session` 应返回 `401` JSON；登录后应能加载 T3 Code，删除 Cookie 后重新访问应回到登录页。

## 环境变量

| 变量 | 含义 |
| --- | --- |
| `T3CODE_GATEWAY_SOCKET` | 网关 Unix socket 路径，需与 Nginx 配置一致 |
| `T3CODE_LOGIN_ORIGIN` | 精确的公开 HTTPS origin，不含末尾斜杠 |
| `T3CODE_LOGIN_USER` / `T3CODE_LOGIN_PASSWORD` | 登录账号和密码 |
| `T3CODE_CSRF_TOKEN` | 登录请求安全校验值；不是上游令牌 |
| `T3CODE_UPSTREAM_TOKEN` | T3 Code 上游访问令牌，仅服务器使用 |
| `T3CODE_SESSION_TTL` | 会话最长寿命，秒 |
| `T3CODE_SESSION_RENEW` | 空闲窗口，秒；不得大于最长寿命 |

不要把真实域名、IP、凭据、Cookie、日志或会话记录放进公开仓库。配置修改后重启网关会使现有会话失效；本项目不会自动续期或轮换 T3 Code 上游令牌。
