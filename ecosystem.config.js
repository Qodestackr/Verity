module.exports = {
  apps: [
    {
      name: "alcora",
      script: "pnpm",
      args: "start",
      instances: 1,
      exec_mode: "fork", // Change to cluster mode
      autorestart: true,
      watch: false, // Disables file watching
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_restarts: 10,
      restart_delay: 3000,
      error_file: "~/.pm2/logs/alcora-prod-error.log",
      out_file: "~/.pm2/logs/alcora-prod-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      ignore_watch: ["node_modules", "public"],
      min_uptime: 5000, // before considering a restart to be successful
      wait_ready: true, // Wait for the app to signal it is ready before taking it out of rotation
      listen_timeout: 8000, // Timeout for listen before restart
    },
  ],
};
