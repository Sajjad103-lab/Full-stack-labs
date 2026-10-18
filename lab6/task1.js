/**
 * TASK 1
 * Async/await function that returns a valid user object on a successful
 * fetch from an API, and throws an error on an unsuccessful fetch.
 * Run with: node task1.js   (Node.js 18+)
 */

const API_URL = "https://jsonplaceholder.typicode.com/users";

function isValidUser(user) {
  return (
    user !== null &&
    typeof user === "object" &&
    typeof user.id === "number" &&
    typeof user.name === "string" && user.name.trim() !== "" &&
    typeof user.email === "string" && user.email.includes("@")
  );
}

async function fetchUser(id) {
  let response;

  try {
    response = await fetch(`${API_URL}/${id}`);
  } catch (networkError) {
    throw new Error(`Network error while fetching user ${id}: ${networkError.message}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}: HTTP ${response.status}`);
  }

  let user;
  try {
    user = await response.json();
  } catch (parseError) {
    throw new Error(`Invalid JSON received for user ${id}`);
  }

  if (!isValidUser(user)) {
    throw new Error(`Invalid user details received for user ${id}`);
  }

  return user;
}

/* ---------------- Demo ---------------- */
async function main() {
  // Successful fetch -> returns valid user
  try {
    const user = await fetchUser(1);
    console.log("Valid user returned:", { id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("Error:", err.message);
  }

  // Unsuccessful fetch -> throws error
  try {
    await fetchUser(99999);
  } catch (err) {
    console.error("Expected error:", err.message);
  }
}

main();
