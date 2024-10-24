export function base64ToObject(base64String: string) {
  try {
    // Decode the Base64 string
    const jsonString = Buffer.from(base64String, "base64").toString("utf-8");

    // Parse the decoded string as JSON
    const obj = JSON.parse(jsonString) as unknown;
    return obj;
  } catch (error) {
    console.error("Failed to convert base64 string to object:", error);
    return null; // or throw the error if you prefer
  }
}
export function objectToBase64(formData: object) {
  const jsonString = JSON.stringify(formData);
  const base64String = Buffer.from(jsonString).toString("base64");
  return base64String;
}
