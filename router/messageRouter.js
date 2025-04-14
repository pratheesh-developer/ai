const express = require("express");
const { SaveMessage, getMessage } = require("../controller/messageController");
const router = express.Router();

router.post("/message",SaveMessage);
router.get("/message",getMessage);



module.exports=router