module.exports = {
  apps: [
    {
      name: 'smart-panchayat-api',
      script: 'src/app.js',

      // Cluster mode — uses all CPU cores
      instances: 'max',
      exec_mode: 'cluster',

      // Auto restart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Restart policy
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,

      // Development environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // Production environment — pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        instances: 'max',
      },
    },
  ],
};
