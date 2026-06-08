module.exports = {
  apps: [
    {
      name: "planning-poker-backend",
      script: "npm",
      args: "run start:dev",
      cwd: "./backend",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000
      }
    },
    {
      name: "planning-poker-frontend",
      script: "npm",
      args: "run dev",
      cwd: "./frontend",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5173
      }
    }
  ]
};
