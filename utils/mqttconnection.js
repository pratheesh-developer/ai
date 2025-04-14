const mqtt = require("mqtt");

let mqttClient = null;

exports.connectMQTT = (userId) => {
  if (!mqttClient) {
    mqttClient = mqtt.connect(
      "wss://ff09506e00fd489686d09bc3db8bbb3e.s1.eu.hivemq.cloud:8884/mqtt",
      {
        clientId: `mqtt_${userId}`,
        username: "pratheesh", 
        password: "Demo@123", // Replace with actual password
      }
    );

    mqttClient.on("connect", () => {
      console.log("✅ MQTT Connected");
    });

    mqttClient.on("error", (err) => {
      console.error("❌ MQTT Error:", err);
    });
  }
  return mqttClient;
};

exports.publishMessage = (topic, message) => {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, message);
  } else {
    console.warn("⚠️ MQTT not connected yet!");
  }
};

