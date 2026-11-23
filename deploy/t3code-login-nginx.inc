    location = /favicon.ico {
        alias /var/www/t3code-login/login-assets/favicon.ico;
        default_type image/x-icon;
    }
    location = /api/v1/auth/csrf {
        proxy_pass http://unix:/run/t3code-login/gateway.sock:/csrf;
    }
    location = /api/v1/auth/sessions {
        limit_req zone=t3code_login burst=5 nodelay;
        limit_req_status 429;
        client_max_body_size 8k;
        proxy_set_header Cookie $http_cookie;
        proxy_pass http://unix:/run/t3code-login/gateway.sock:/signin;
    }
    location = /logout {
        proxy_pass http://unix:/run/t3code-login/gateway.sock:/logout;
    }
    location = /_t3code_auth {
        internal;
        proxy_method GET;
        proxy_pass_request_body off;
        proxy_pass_request_headers off;
        proxy_set_header Content-Length "";
        proxy_set_header Cookie $http_cookie;
        proxy_set_header X-T3Code-Renew $t3code_renew_navigation;
        proxy_pass http://unix:/run/t3code-login/gateway.sock:/check;
    }
    location ^~ /api/ {
        include /etc/nginx/t3code-secrets/gateway-upstream.inc;
        error_page 401 = @t3code_unauthenticated;
    }
    location = /ws {
        include /etc/nginx/t3code-secrets/gateway-upstream.inc;
        error_page 401 = @t3code_unauthenticated;
    }
    location / {
        include /etc/nginx/t3code-secrets/gateway-upstream.inc;
        error_page 401 = @t3code_login;
    }
    location @t3code_unauthenticated {
        default_type application/json;
        add_header Cache-Control "no-store" always;
        return 401 '{"error":"unauthenticated"}';
    }
    location @t3code_login {
        add_header Cache-Control "no-store" always;
        return 303 /login;
    }
