/**
 * TASK 2
 * Use Promise.all to catch the promises returned by two async operations,
 * then reject or accept the main promise (promise of Promise.all) based on
 * whether the details fetched by BOTH async functions are valid or not.
 * Run with: node task2.js   (Node.js 18+)
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

// The two async functions (same as Task 1, included so this file runs alone)
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

// The main promise: a promise wrapping Promise.all
function fetchBothUsers(id1, id2) {
  return new Promise((resolve, reject) => {
    Promise.all([fetchUser(id1), fetchUser(id2)])
      .then(([user1, user2]) => {
        if (isValidUser(user1) && isValidUser(user2)) {
          resolve({ user1, user2 });          // accept: both valid
        } else {
          reject(new Error("One or both users are invalid"));
        }
      })
      .catch((error) => {
        reject(error);                        // reject: any failure
      });
  });
}

/* ---------------- Demo ---------------- */
async function main() {
  // Both valid -> main promise accepted
  try {
    const { user1, user2 } = await fetchBothUsers(1, 2);
    console.log("ACCEPTED -> both valid:", user1.name, "&", user2.name);
  } catch (err) {
    console.error("REJECTED:", err.message);
  }

  // One invalid -> main promise rejected
  try {
    const result = await fetchBothUsers(1, 99999);
    console.log("ACCEPTED:", result);
  } catch (err) {
    console.error("REJECTED -> one invalid:", err.message);
  }
}

main();
