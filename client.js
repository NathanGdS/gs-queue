import { randomUUID } from "node:crypto";
import * as net from "node:net";
export class GsQueueClient {
  subscribers = [];
  client = null;

  constructor() {
    this.client = new net.Socket();

    this.client.connect(1337, "127.0.0.1", () => {
      console.log("Connected");
      this.client.on("data", (data) => this.handleData(data)); // Handle data here
    });

    this.client.on("error", (err) => {
      console.error("Client error:", err);
    });

    this.client.on("close", () => {
      console.log("Client connection closed.");
    });
  }

  handleData(data) {
    console.log("[CLIENT] Data received from server");
    try {
      const message = JSON.parse(data.toString());
      console.log("[CLIENT] Message received", message);
      if (
        message.kind === "reply" &&
        this.subscribers.includes(
          this.subscribers.find((q) => q.uniqueName == message.queue)
        )
      ) {
        this.emit("reply", message); // Emit reply event
      } else if (message.kind === "error") {
        this.emit("error", message); // emit error event.
        console.error("[CLIENT] Error message received", message);
      } else {
        console.log(
          "No subscribers for this message in client " +
            this.subscribers +
            " for kind " +
            message.kind +
            " and queue " +
            message.queue
        );
      }
    } catch (error) {
      console.error("Error parsing message", error);
    }
  }

  subscribe(queue) {
    const id = randomUUID();
    const uniqueName = `${queue}-${id}`;
    this.subscribers.push({ queue, _id: randomUUID(), uniqueName });
    console.log("Subscribed to queue", queue);
  }

  emit(event, data) {
    this.client.emit(event, data); // Emit custom event
  }

  send(queue, message) {
    const payload = JSON.stringify({
      queue: this.subscribers.find((q) => q.queue == queue).uniqueName,
      message,
    });
    console.log("[CLIENT] Sending message", payload);
    this.client.write(payload);
  }

  on(event, callback) {
    this.client.on(event, callback);
  }

  listeners() {
    return this.subscribers;
  }
}
