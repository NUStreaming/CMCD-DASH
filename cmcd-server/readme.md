## Overview

`nginx/`: Nginx JS (njs) webserver and middleware.
`dash-server/`: Dash server, where required. (Python/Node.js/Express - TBC)

## Installation & Setup

- Install Nginx Open Source
- Install njs module in nginx
  - Ubuntu: `sudo apt install nginx-module-njs` (if module not found, purge nginx and reinstall following: http://nginx.org/en/linux_packages.html#Ubuntu)
  - Mac OSX: See https://github.com/Jiri-Mihal/install-nginx-module-mac-osx 
  (Note change in `--add-dynamic-module=../njs-XXXXXXXXX` to `--add-dynamic-module=../njs-XXXXXXXXX/nginx`)
  <!-- - Ubuntu guides: http://nginx.org/en/docs/njs/install.html (njs sources, using same installation instructions as Mac OSX guide), https://makandracards.com/konjoot/38441-ubuntu-nginx-with-txid-module (dependency packages) -->
- **Update `nginx.conf` file with your `<PATH_TO_CMCD-DASH>` (under `location /media/vod { ... }`)**

## Quickstart

- Launch nginx: `nginx -c <PATH_TO_CMCD-DASH>/cmcd-server/nginx/config/nginx.conf`
  - Note: Must be *absolute path* for the config file
- **Reload nginx config: `nginx -c <PATH_TO_CMCD-DASH>/cmcd-server/nginx/config/nginx.conf -s reload`**
- Stop nginx: `nginx -c <PATH_TO_CMCD-DASH>/cmcd-server/nginx/config/nginx.conf -s quit`

- Test njs with CMCD: `http://localhost:8080/cmcd-njs/testProcessQuery?CMCD=bl%3D21300%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22`
  - See `nginx/cmcd_njs.js` for more details.

- Check if nginx is running:
  - `curl http://127.0.0.1:8080`
  - Or `ps -ef | grep nginx`
  - Or `systemctl status nginx` for webserver status
- Check nginx version: `nginx -v`

## Nginx Misc

### File locations

Ubuntu
- Log files: `/var/log/nginx/`
  - `tail -f error.log`
  - `tail -f access.log`

Mac OSX
- Log files: `/usr/local/var/log/nginx/`
  - `tail -f error.log`
- Conf files: `/usr/local/etc/nginx/`
- Web files: `/usr/local/var/www/`