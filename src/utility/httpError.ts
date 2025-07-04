

class HTTPError extends Error {
  code: number;
  details: any; // This will store the JSON object if passed

  constructor(message: string | any, code: number) {
    if (typeof message === "string") {
      super(message); // Use the message as is for strings
    } else {
      // If it's a JSON object, assign a generic error message and store the actual object in `details`
      super("An error occurred");
      this.details = message; // Keep the JSON object as is
    }
    this.code = code;
  }
}

export default HTTPError;
