/** Server startup for BizTime. */
const app = require("./app");

app.listen(3000, function () {
  console.log("Application start, listening on port 3000...");
});