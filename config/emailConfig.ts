export const emailHost = "smtpout.secureserver.net";
export const emailPort = 587;
export const emailSecure = true;
export const emailService: string =
  process.env.NODE_ENV === "prod" ? "" : "gmail";
