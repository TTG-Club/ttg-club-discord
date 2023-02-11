module.exports = {
  apps : [{
    name   : "ttg-club-discord",
    script : "./dist/index.js",
    autorestart: true,
    restart_delay: 1000
  }]
}
