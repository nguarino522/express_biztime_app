/** BizTime express application. */
const express = require("express");
const morgan = require("morgan");
const app = express();
const ExpressError = require("./expressError");
const cRoutes = require("./routes/companies.js")
const iRoutes = require("./routes/invoices.js")

app.use(morgan("dev"));
app.use(express.json());
app.use("/companies", cRoutes);
app.use("/invoices", iRoutes);

/** 404 handler */
app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: err
  });
});


module.exports = app;
