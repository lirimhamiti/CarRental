// Generates the bcrypt hash for ADMIN_PASSWORD_HASH.
// Usage: npx tsx scripts/hash-password.ts <password>
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npx tsx scripts/hash-password.ts <password>");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});
