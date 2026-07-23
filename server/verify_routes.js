async function testRoutes() {
  const BASE_URL = "http://localhost:5000";
  let passCount = 0;
  let failCount = 0;
  let token = "";
  let userId = "";
  let projectId = "";

  async function req(name, method, path, body, headers = {}) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        console.log(`✅ [PASS] ${method} ${path}`);
        passCount++;
        return data;
      } else {
        console.error(`❌ [FAIL] ${method} ${path} - Status: ${res.status}`);
        failCount++;
        return null;
      }
    } catch (e) {
      console.error(`❌ [FAIL] ${method} ${path} - Error: ${e.message}`);
      failCount++;
      return null;
    }
  }

  console.log("--- Starting API Regression Tests ---");

  // 1. Auth Tests
  const signupRes = await req("Signup", "POST", "/api/auth/signup", {
    name: "Test Runner",
    email: `test_${Date.now()}@test.com`,
    password: "password123"
  });
  if (signupRes) {
    token = signupRes.token;
  }

  const loginRes = await req("Login", "POST", "/api/auth/login", {
    email: signupRes ? signupRes.user.email : "invalid@test.com",
    password: "password123"
  });
  if (loginRes) {
    token = loginRes.token;
    userId = loginRes.user.id;
  }

  await req("Get Me", "GET", "/api/auth/me", null, { Authorization: `Bearer ${token}` });

  // 2. Projects Tests
  const projRes = await req("Create Project", "POST", "/api/projects", {
    title: "Test Project",
    prompt: "Test Prompt"
  }, { Authorization: `Bearer ${token}` });
  
  if (projRes) {
    projectId = projRes._id;
  }

  await req("Get Projects", "GET", "/api/projects", null, { Authorization: `Bearer ${token}` });
  if (projectId) {
    await req("Get Project", "GET", `/api/projects/${projectId}`, null, { Authorization: `Bearer ${token}` });
    await req("Update Project", "PATCH", `/api/projects/${projectId}`, { status: "PROCESSING" }, { Authorization: `Bearer ${token}` });
    await req("Delete Project", "DELETE", `/api/projects/${projectId}`, null, { Authorization: `Bearer ${token}` });
  }

  // 3. Designs Tests
  const designRes = await req("Create Design", "POST", "/api/designs", {
    userId: userId || "123456789012345678901234",
    designName: "Test Design",
    config: {},
    imageUrl: ""
  });
  const designId = designRes ? designRes._id : "invalid";
  await req("Get Designs", "GET", `/api/designs/${userId || "123456789012345678901234"}`);
  await req("Delete Design", "DELETE", `/api/designs/${designId}`);

  // 4. Contact Test
  await req("Contact", "POST", "/api/contact", { name: "A", email: "a@a.com", message: "A" });

  // 5. AI Tests
  await req("AI Health", "GET", "/api/ai/health");
  await req("Check Credits", "GET", "/api/ai/check-credits", null, { Authorization: `Bearer ${token}` });

  // Avoid doing expensive AI generation for real, just verify the endpoint exists and returns a validation error or handles it
  await req("Gen Blueprint", "POST", "/api/ai/generate-blueprint", { prompt: "Test" });
  await req("Gen Agentic", "POST", "/api/ai/generate-agentic-website", { prompt: "Test" });
  await req("Gen 3D", "POST", "/api/ai/generate-3d-model", { prompt: "Test" });

  console.log(`\n--- Test Summary ---`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
}

testRoutes();
