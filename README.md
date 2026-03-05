# Sopumshop Setup Scripts

This folder is ready to be copied into your GitHub project (`sopumshop`).

Structure:
- `01_node_npm_setup`: Node.js 22 + npm + git install
- `02_user_and_dirs`: app user and base directory setup
- `03_frontend_setup`: React + Vite scaffold, install, build
- `04_nginx_deploy`: Nginx config + SELinux context + verify
- `05_dev_run`: run dev server for frontend
- `06_landing_page_insideobject`: landing page source files (insideobject-style mood)

Run scripts in order by folder and file name (`1_...`, `2_...`, ...).

All scripts assume Rocky Linux 8 and root permissions unless noted.
