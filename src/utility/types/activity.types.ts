export interface INotificationMessage {
  heading: string;
  courseTitle: string;
  instructorId: string;
  createdAt: Date;
  type: "courseEdited" | "courseRated";
  recipients: string[];
}
