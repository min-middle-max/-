# Script Order

Use this order:

1. `01_node_npm_setup/1_enable_node22_module.sh`
2. `01_node_npm_setup/2_install_node_npm_git.sh`
3. `02_user_and_dirs/1_create_app_user.sh`
4. `02_user_and_dirs/2_create_base_directories.sh`
5. `03_frontend_setup/1_create_vite_react_app.sh`
6. `03_frontend_setup/2_install_dependencies.sh`
7. `03_frontend_setup/3_build_production.sh`
8. `04_nginx_deploy/1_create_nginx_conf_8080.sh`
9. `04_nginx_deploy/2_apply_selinux_context.sh`
10. `04_nginx_deploy/3_reload_and_verify_nginx.sh`

Optional:
- `05_dev_run/1_run_vite_dev_server.sh`

Note:
- Port `80/443` may already be used by other configs.
- This setup uses `8080` for Sopumshop.
