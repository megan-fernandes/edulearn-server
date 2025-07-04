export const textSearchSanitize = (title: string): string => {
    // Remove special characters from the start
    title = title.replace(/^[^a-zA-Z0-9]+/, "");
  
    // Remove special characters except `/` and `-` in between
    title = title.replace(/[^a-zA-Z0-9\s/-]/g, "");
  
    // Convert to lowercase
    return title.toLowerCase();
  };