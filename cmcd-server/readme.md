# Overview

Nginx JS (njs) webserver and middleware.

# Installation & Setup

- Install Nginx Open Source
- Install njs module in nginx
  - Mac OSX guide: https://github.com/Jiri-Mihal/install-nginx-module-mac-osx 
  (Note change in `--add-dynamic-module=../njs-XXXXXXXXX` to `--add-dynamic-module=../njs-XXXXXXXX/nginx`)
- **Setup njs in nginx config**
  - Update `nginx.conf` with the below. Remember to update `<PATH_TO_CMCD-DASH>`

```
# nginx.conf

...

# njs additions
load_module modules/ngx_http_js_module.so;

...

http {
    ...

    # njs additions
    js_import <PATH_TO_CMCD-DASH>/cmcd-server/http_cmcd.js;

    ...

    server {
        ...

        # njs and cmcd additions
        location /cmcd/testProcessQuery {
            js_content http_cmcd.testProcessQuery;
        }
        location /cmcd/testRateControl {
            js_content http_cmcd.testRateControl;
        }
        ...
    }
    ...
}
```

# Quickstart

## Mac OSX

- Launch nginx: `nginx`
- Reload nginx config: `nginx -s reload`
- Stop nginx: `nginx -s quit`

- Check if nginx is running:
  - `curl http://127.0.0.1:8080`
  - OR `ps -ef | grep nginx`
  - OR `systemctl status nginx` for webserver status

- Check nginx version: `nginx -v`

- Test njs: `http://localhost:8080/cmcd/testProcessQuery?CMCD=bl%3D21302%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22`


# File Locations

## Mac OSX

- Conf files: `/usr/local/etc/nginx/`
- Log files: `/usr/local/var/log/nginx/`
- Web files: `/usr/local/var/www/`