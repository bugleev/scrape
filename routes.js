const express = require("express");
const router = express.Router();
const scrapeController = require("./scrapeController");


router.get("/", scrapeController.homePage);
router.post("/", scrapeController.scrape);



module.exports = router;
