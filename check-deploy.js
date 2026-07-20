import process from "process";

const baseUrl = process.argv[2] || "https://ecommerce-api-tio6.onrender.com";
const paths = ["/version", "/ready"];

const run = async () => {
  console.log(`Checking deployment at ${baseUrl}`);
  for (const path of paths) {
    const url = new URL(path, baseUrl).toString();
    try {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      console.log(`\n${path} -> ${res.status}`);
      console.log(text);
    } catch (error) {
      console.error(`\n${path} -> ERROR: ${error.message}`);
    }
  }
};

run().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
