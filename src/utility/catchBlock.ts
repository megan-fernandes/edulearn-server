import HTTPError from "./httpError";

export const catchError = (error: any) => {
  console.log("Service Error->Log:", error);
  if (error instanceof HTTPError) {
    const errorData = error.details || error.message;
    return new HTTPError(errorData, error.code);
  } else {
    return new HTTPError(error.name, 500);
  }
};
