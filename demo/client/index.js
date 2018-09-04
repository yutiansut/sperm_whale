const client = require("../../clicnt/index")

const clients = new client({
  port: 89,
  host: "www.xivistudios.com",
  auth: { username: "panda", password: "test" }
})

clients.on("error", function (error) {
  console.log(error)
})

