const client = require("../../clicnt/index")

const clients = new client({
  port: 88,
  host: "localhost",
  auth: { username: "panda", password: "test" }
})

clients.on("error", function (error) {
  console.log(error)
})

