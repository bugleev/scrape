const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  puppeteer = require('puppeteer');

require("dotenv").config({ path: "variables.env" });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use((req, res, next) => {
  res.locals.pageTitle = "";
  next();
});

const routes = require("./routes");
app.use("/", routes);

app.set("port", process.env.PORT || 3000);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

