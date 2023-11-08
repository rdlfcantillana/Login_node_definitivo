const {Pool} = require("pg");
const DBconfig = new Pool({
  "user":"postgres",
  "host":"localhost",
  "password":"musubi88",
  "database":"sesion"
}
)

module.exports =  DBconfig;