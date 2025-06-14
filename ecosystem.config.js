module.exports = {
  apps: [
    {
      name: "younghee-squidgame",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        DOMAIN: "younghee.squidminigame.com",
        API_BASE_URL: "https://younghee.squidminigame.com",
        SSL_ENABLED: true,
      },
      error_file: "/var/log/squidgame-error.log",
      out_file: "/var/log/squidgame-out.log",
      log_file: "/var/log/squidgame.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
    },
  ],
};
