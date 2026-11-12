# Deploy to cPanel and an Oracle VM

The frontend is `https://poker.ejacobi.com.br/` and the backend is
`https://poker-api.ejacobi.com.br`. Both must use HTTPS; browsers otherwise
block requests from the secure frontend.

## Backend: Oracle VM

These steps assume Ubuntu, a public VM IP, and DNS pointing
`poker-api.ejacobi.com.br` to that IP. Install a supported Node.js LTS version
(Node 22 or newer), npm, Git, Nginx, Certbot with its Nginx plugin, and the
build tools needed by SQLite. Open TCP ports 80 and 443 in both the Oracle
Cloud security list or network security group and the VM firewall. Keep SSH
restricted to trusted addresses. Do not expose port 3000 publicly.

On the VM, clone the repository at `/opt/easy-planning-poker`, then:

```sh
cd /opt/easy-planning-poker/backend
npm ci
npm run build
sudo useradd --system --home /var/lib/easy-planning-poker --shell /usr/sbin/nologin poker
sudo install -d -o poker -g poker /var/lib/easy-planning-poker
```

The `poker` user needs read and execute access to the repository and its
dependencies. Create `/etc/easy-planning-poker.env` as root:

```ini
NODE_ENV=production
PORT=3000
DATABASE_STORAGE=/var/lib/easy-planning-poker/database.sqlite
SESSION_SALT=replace-with-a-long-random-secret
TRUST_PROXY=loopback
```

Generate the salt with `openssl rand -hex 32`, keep it stable across restarts,
and protect the file with `sudo chmod 600 /etc/easy-planning-poker.env`.
Create `/etc/systemd/system/easy-planning-poker.service`:

```ini
[Unit]
Description=Easy Planning Poker API
After=network.target

[Service]
Type=simple
User=poker
WorkingDirectory=/opt/easy-planning-poker/backend
EnvironmentFile=/etc/easy-planning-poker.env
ExecStart=/usr/bin/node /opt/easy-planning-poker/backend/dist/main.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Replace `/usr/bin/node` with the absolute path from `command -v node` if
different. Start it with:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now easy-planning-poker
sudo systemctl status easy-planning-poker
curl http://127.0.0.1:3000/api/health
```

Configure Nginx at `/etc/nginx/sites-available/easy-planning-poker`. The
`map` belongs at HTTP scope (the standard Ubuntu `sites-enabled` include is
at HTTP scope):

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name poker-api.ejacobi.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 75s;
    }
}
```

Enable the site, check the configuration, and obtain a certificate:

```sh
sudo ln -s /etc/nginx/sites-available/easy-planning-poker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d poker-api.ejacobi.com.br
curl https://poker-api.ejacobi.com.br/api/health
```

`TRUST_PROXY=loopback` makes rate limits use the client IP forwarded by this
local Nginx proxy. Keep the backend port inaccessible externally and ensure
Nginx overwrites `X-Forwarded-For` as shown; only trusted local processes
should be able to reach it. Other proxy topologies require different trust
configuration.

SQLite data lives in `/var/lib/easy-planning-poker`; back it up using a
SQLite-consistent backup, not just a copy during writes. Run only one backend
instance: live votes and rate limits are held in memory and reset on restart.

## Frontend: cPanel

Point DNS for `poker.ejacobi.com.br` to the cPanel hosting server, configure
the subdomain in cPanel, and enable its HTTPS certificate. Build locally with
Node.js 22 or newer. From the repository root:

```sh
cd frontend
npm ci
VITE_BACKEND_URL=https://poker-api.ejacobi.com.br npm run build -- --base=/
```

In PowerShell, set the variable with
`$env:VITE_BACKEND_URL = "https://poker-api.ejacobi.com.br"` before running
`npm run build -- --base=/`. The backend URL is embedded at build time:
use the HTTPS origin without a trailing slash, and rebuild if it changes.

Upload the **contents** of `frontend/dist` to the document root configured
for `poker.ejacobi.com.br` in cPanel. Include the hidden
`.htaccess` file: it directs direct room links and page refreshes to the Vue
app without rewriting existing files. This requires Apache `mod_rewrite` and
permission to use `.htaccess`; ask the host to enable them if necessary. Do
not place this rewrite in a parent folder that contains other applications.

Open the frontend, create a room, open its invite link in another browser,
and verify voting and chat work. Also refresh the room URL. For diagnosis,
check `sudo journalctl -u easy-planning-poker` and Nginx logs.

The application currently identifies users by browser-provided IDs; it is
not an authenticated access-control system. Do not use it for sensitive
sessions without adding proper authentication and authorization.
