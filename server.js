const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { DbConnection } = require("./config/DbConnection");
const messageRouter = require("./router/messageRouter");
const { connectMQTT } = require("./utils/mqttconnection");
const app = express();
// middlewares

app.use(cors({
    origin: 'https://astounding-stroopwafel-af9c19.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(express.json());
app.use("/api",messageRouter);
// connectdb
DbConnection();
connectMQTT(`mqtt_${Date.now()}`)
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
