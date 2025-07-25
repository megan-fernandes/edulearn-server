import amqplib from "amqplib";
import { INotificationMessage } from "./types/activity.types";
import { getIO } from "./socket";
import dotenv from "dotenv";
dotenv.config();

const queue = process.env.RABBITMQ_QUEUE_NAME as string;
const rabbit_url = process.env.RABBIT_URL as string;

export const publishNotification = async (queueName: string, message: any) => {
  try {
    const conn = await amqplib.connect(rabbit_url);
    const channel = await conn.createChannel();
    if (!channel) {
      throw new Error("RabbitMQ channel is not initialized.");
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const success = channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
    });

    if (success) {
      console.log(`Message published to queue: ${queueName}`);
    } else {
      console.error(`Failed to publish message to queue: ${queueName}`);
    }
  } catch (error) {
    console.error("Error publishing message:", error);
  }
};

export const consumeNotifications = async () => {
  const conn = await amqplib.connect(rabbit_url);
  const channel = await conn.createChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, (msg) => {
    console.log("consuming::", msg);
    if (msg !== null) {
      const data: INotificationMessage = JSON.parse(msg.content.toString());
      const {
        heading,
        courseTitle,
        instructorId,
        createdAt,
        type,
        recipients,
      } = data;
      console.log("DATA for consumption::", data);

      // Emit to users via socket
      const io = getIO();

      if (type === "courseEdited") {
        console.log("courseEdited");
        recipients.forEach((userId: string) =>
          io.to(userId).emit("notification", {
            message: {
              heading,
              primaryText: `Course :${courseTitle} has been updated. Navigate to My Courses to learn what's new `,
              timeStamp: createdAt,
              type,
            },
          })
        );
      } else if (type === "courseRated") {
        console.log("courseRated");
        io.to(instructorId).emit("notification", {
          message: {
            heading,
            primaryText: `Your Course :${courseTitle} has been rated by a student`,
            timeStamp: createdAt,
          },
        });
      }

      channel.ack(msg);
    }
  });
};
