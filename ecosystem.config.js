module.exports = {
  apps: [
    {
      name: "planning-poker-backend",
      script: "node_modules/@nestjs/cli/bin/nest.js",
      args: "start --watch",
      cwd: "./backend",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000
      }
    },
    {
      name: "planning-poker-frontend",
      script: "node_modules/vite/bin/vite.js",
      args: "",
      cwd: "./frontend",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5173
      }
    }
  ]
};
