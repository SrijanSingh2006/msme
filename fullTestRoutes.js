import fetch from "node-fetch";

const BASE_URL = "http://localhost:5003/api";

async function testEndpoint(method, url, body = null) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json().catch(() => ({}));
    console.log(`${method.padEnd(6)} ${url.padEnd(20)} -> Status: ${res.status} | Response:`, data);
    return data;
  } catch (err) {
    console.log(`${method} ${url} -> Error:`, err.message);
  }
}

async function runTests() {
  console.log("\nTesting all API routes...\n");

  // TEST /api/test
  await testEndpoint("GET", "/test");

  // TEST cashbook
  const cashbookPost = await testEndpoint("POST", "/cashbook", { name: "Cash Entry", amount: 100 });
  const cashbookId = cashbookPost.id;
  await testEndpoint("GET", "/cashbook");
  await testEndpoint("GET", `/cashbook/${cashbookId}`);
  await testEndpoint("PUT", `/cashbook/${cashbookId}`, { name: "Updated Cash", amount: 200 });
  await testEndpoint("DELETE", `/cashbook/${cashbookId}`);

  // TEST payroll
  const payrollPost = await testEndpoint("POST", "/payroll", {
    employee_name: "Srijan Singh",
    salary: 50000,
    month: "September",
  });
  const payrollId = payrollPost.id;
  await testEndpoint("GET", "/payroll");
  await testEndpoint("GET", `/payroll/${payrollId}`);
  await testEndpoint("PUT", `/payroll/${payrollId}`, { employee_name: "Srijan Updated", salary: 55000, month: "October" });
  await testEndpoint("DELETE", `/payroll/${payrollId}`);

  // TEST credit-kit
  const creditKitPost = await testEndpoint("POST", "/credit-kit", { kitName: "Starter Kit" });
  const creditKitId = creditKitPost.id;
  await testEndpoint("GET", "/credit-kit");
  await testEndpoint("GET", `/credit-kit/${creditKitId}`);
  await testEndpoint("PUT", `/credit-kit/${creditKitId}`, { kitName: "Updated Kit" });
  await testEndpoint("DELETE", `/credit-kit/${creditKitId}`);

  // TEST schemes
  const schemesPost = await testEndpoint("POST", "/schemes", { schemeName: "New Scheme" });
  const schemeId = schemesPost.id;
  await testEndpoint("GET", "/schemes");
  await testEndpoint("GET", `/schemes/${schemeId}`);
  await testEndpoint("PUT", `/schemes/${schemeId}`, { schemeName: "Updated Scheme" });
  await testEndpoint("DELETE", `/schemes/${schemeId}`);

  // TEST users
  const timestamp = Date.now(); // unique identifier
  const userPost = await testEndpoint("POST", "/users", {
    name: "Alice",
    email: `alice${timestamp}@example.com`, // unique email
    phone: `98765${Math.floor(Math.random() * 10000)}`, // unique phone
    locale: "en",
  });
  const userId = userPost.user_id;
  await testEndpoint("GET", "/users");
  await testEndpoint("GET", `/users/${userId}`);
  await testEndpoint("PUT", `/users/${userId}`, {
    name: "Alice Updated",
    email: `alice_updated${timestamp}@example.com`,
    phone: `98765${Math.floor(Math.random() * 10000)}`,
    locale: "en",
  });
  await testEndpoint("DELETE", `/users/${userId}`);

  console.log("\n✅ Full API testing complete!\n");
}

runTests();
