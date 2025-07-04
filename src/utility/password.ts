export const generatePassword = (): string => {
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%&*_+|.?";

  // Pick one character from each required set
  const oneUpper = upperCase[Math.floor(Math.random() * upperCase.length)];
  const oneLower = lowerCase[Math.floor(Math.random() * lowerCase.length)];
  const oneNumber = numbers[Math.floor(Math.random() * numbers.length)];
  const oneSpecial =
    specialChars[Math.floor(Math.random() * specialChars.length)];

  // Remaining characters: 4 (8 - 4 = 4 more to add)
  const allChars = upperCase + lowerCase + numbers;
  const remainingLength = 8 - 4;
  let remainingChars = "";
  for (let i = 0; i < remainingLength; i++) {
    remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Combine all and shuffle
  const passwordArray = (
    oneUpper +
    oneLower +
    oneNumber +
    oneSpecial +
    remainingChars
  ).split("");
  const shuffledPassword = passwordArray
    .sort(() => 0.5 - Math.random()) // Shuffle array
    .join("");

  return shuffledPassword;
};
