// Simple local test to POST to forgot-password and print response
(async () => {
  try {
    const url = "http://localhost:5000/api/auth/forgot-password";
    const body = { email: "gouravdas350@gmail.com" };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("HTTP", res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error("Request failed:", err);
    process.exitCode = 1;
  }
})();
