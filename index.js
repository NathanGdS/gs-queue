import * as net from "node:net";
import { GsQueueClient } from "./client.js";

const server = net.createServer(function (socket) {
  socket.on("data", function (data) {
    try {
      const payload = JSON.parse(data.toString());
      const { queue, message } = payload;

      if (!queue || !message) {
        console.error("[SERVER] Invalid message received", payload);
        socket.write(
          JSON.stringify({
            kind: "error",
            error: "Invalid message received",
          })
        );
      } else {
        const reply = { queue, message, kind: "reply" };
        console.log("[SERVER] Message received", reply);
        socket.write(JSON.stringify(reply));
      }
    } catch (error) {
      console.error("[SERVER] Error parsing message", error);
      socket.write(
        JSON.stringify({
          kind: "error",
          error: "Invalid JSON message received",
        })
      );
    }
  });

  socket.on("close", function () {
    console.log("Connection closed.");
  });
});

server.on("listening", function () {
  console.log("Server is listening on port 1337");
});

server.listen(1337, "127.0.0.1");

const message = JSON.stringify({
  id: 1,
  body: "Hello World",
  paymentMethod: "creditCard",
});

const client = new GsQueueClient();
client.subscribe("queue");
client.send("queue", message);

client.on("reply", function (data) {
  console.log("[CLIENT] Received reply: ", data);
});
