document.addEventListener("DOMContentLoaded", () => {
  const state = {
    page: "home",
    theme: localStorage.getItem("wm_theme") || "dark",
    history: []
  };

  if (state.theme === "light") document.body.classList.add("light");

  // Theme Toggle
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light");
      state.theme = document.body.classList.contains("light") ? "light" : "dark";
      localStorage.setItem("wm_theme", state.theme);
      themeBtn.textContent = state.theme === "light" ? "☀" : "☾";
    });
    themeBtn.textContent = state.theme === "light" ? "☀" : "☾";
  }

  // Navigation Routing
  const pages = document.querySelectorAll(".page");
  const navs = document.querySelectorAll(".nav");

  function setPage(id) {
    state.page = id;
    pages.forEach(p => p.classList.toggle("active", p.id === id));
    navs.forEach(n => n.classList.toggle("active", n.getAttribute("data-page") === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navs.forEach(n => {
    n.addEventListener("click", () => setPage(n.getAttribute("data-page")));
  });

  document.querySelectorAll("[data-open]").forEach(el => {
    el.addEventListener("click", () => setPage(el.getAttribute("data-open")));
  });

  // Setup Provider Selector Header
  const chatHead = document.querySelector("#chat .page-head");
  if (chatHead && !document.querySelector("#provider")) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "margin-top:14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;";
    wrap.innerHTML = `
      <label style="font-size:11px;font-weight:800;color:#657186">AI PROVIDER:</label>
      <select id="provider" style="width:160px;padding:6px;border-radius:6px;border:1px solid #cbd5e1">
        <option value="deepseek">DeepSeek AI</option>
        <option value="gemini">Google Gemini</option>
      </select>
      <span id="aiStatus" style="font-size:11px;color:#718096">Checking backend...</span>
    `;
    chatHead.appendChild(wrap);
  }

  // Check Backend Health
  async function checkHealth() {
    const statusEl = document.getElementById("aiStatus");
    const modeEl = document.querySelector(".sidebar .mode");
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.ok) {
        if (statusEl) statusEl.textContent = "✓ Connected (Real AI)";
        if (modeEl) {
          modeEl.innerHTML = '<span class="dot" style="background:#10b981"></span> Real AI Active';
        }
      }
    } catch {
      if (statusEl) statusEl.textContent = "⚠ Server offline";
    }
  }
  checkHealth();

  // Toast notifications
  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
  }

  // Copy buttons
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy");
      const target = document.getElementById(targetId);
      if (target) {
        navigator.clipboard.writeText(target.innerText);
        showToast("Copied to clipboard!");
      }
    });
  });

  // API Call helper
  async function callAI(kind, data) {
    const providerSelect = document.getElementById("provider");
    const provider = providerSelect ? providerSelect.value : "deepseek";
    
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, kind, data })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Generation failed");
    return json.answer;
  }

  // Save to Notion helper
  async function saveNotion(title, content, kind) {
    const res = await fetch("/api/notion/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, kind })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to save to Notion");
    showToast("Successfully saved to Notion page!");
  }

  // Tool 1: Email Generator
  const makeEmailBtn = document.getElementById("makeEmail");
  if (makeEmailBtn) {
    makeEmailBtn.addEventListener("click", async () => {
      const audience = document.getElementById("aud").value;
      const tone = document.getElementById("tone").value;
      const context = document.getElementById("emailCtx").value;
      const out = document.getElementById("emailResult");

      if (!context.trim()) {
        showToast("Please enter email context.");
        return;
      }

      out.textContent = "Generating email...";
      out.classList.remove("empty");

      try {
        const answer = await callAI("email", { audience, tone, context });
        out.textContent = answer;
      } catch (err) {
        out.textContent = "Error: " + err.message;
      }
    });
  }

  // Tool 2: Meeting Summarizer
  const makeMeetingBtn = document.getElementById("makeMeeting");
  if (makeMeetingBtn) {
    makeMeetingBtn.addEventListener("click", async () => {
      const text = document.getElementById("meetingIn").value;
      const out = document.getElementById("meetingResult");

      if (!text.trim()) {
        showToast("Please enter meeting notes.");
        return;
      }

      out.textContent = "Summarizing meeting...";
      out.classList.remove("empty");

      try {
        const answer = await callAI("meeting", { text });
        out.textContent = answer;
      } catch (err) {
        out.textContent = "Error: " + err.message;
      }
    });
  }

  // Tool 3: Task Planner
  const makePlanBtn = document.getElementById("makePlan");
  if (makePlanBtn) {
    makePlanBtn.addEventListener("click", async () => {
      const text = document.getElementById("tasksIn").value;
      const horizon = document.getElementById("horizon").value;
      const out = document.getElementById("taskResult");

      if (!text.trim()) {
        showToast("Please enter tasks.");
        return;
      }

      out.textContent = "Building priority plan...";
      out.classList.remove("empty");

      try {
        const answer = await callAI("tasks", { text, horizon });
        out.textContent = answer;
      } catch (err) {
        out.textContent = "Error: " + err.message;
      }
    });
  }

  // Tool 4: Research Assistant
  const makeResearchBtn = document.getElementById("makeResearch");
  if (makeResearchBtn) {
    makeResearchBtn.addEventListener("click", async () => {
      const text = document.getElementById("researchIn").value;
      const type = document.getElementById("researchType").value;
      const out = document.getElementById("researchResult");

      if (!text.trim()) {
        showToast("Please enter research topic or text.");
        return;
      }

      out.textContent = "Analyzing research...";
      out.classList.remove("empty");

      try {
        const answer = await callAI("research", { text, type });
        out.textContent = answer;
      } catch (err) {
        out.textContent = "Error: " + err.message;
      }
    });
  }

  // Notion Save Binding
  document.querySelectorAll(".notion-save").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-target");
      const kind = btn.getAttribute("data-kind");
      const contentEl = document.getElementById(targetId);
      if (!contentEl || contentEl.classList.contains("empty") || !contentEl.textContent.trim()) {
        showToast("Nothing to save yet.");
        return;
      }
      try {
        btn.textContent = "Saving...";
        await saveNotion(`WorkMate Output - ${kind.toUpperCase()}`, contentEl.textContent, kind);
      } catch (err) {
        showToast(err.message);
      } finally {
        btn.textContent = "Save to Notion";
      }
    });
  });

  // Notion Search
  const searchNotionBtn = document.getElementById("searchNotion");
  if (searchNotionBtn) {
    searchNotionBtn.addEventListener("click", async () => {
      const query = document.getElementById("notionSearch").value;
      const resContainer = document.getElementById("notionResults");
      resContainer.style.display = "block";
      resContainer.textContent = "Searching Notion workspace...";

      try {
        const r = await fetch("/api/notion/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const json = await r.json();
        if (!json.ok) throw new Error(json.error);
        if (json.results.length === 0) {
          resContainer.textContent = "No pages found.";
          return;
        }
        resContainer.innerHTML = json.results.map(p => `<div style="padding:4px 0"><a href="${p.url}" target="_blank" style="color:#2563eb">${p.title}</a></div>`).join("");
      } catch (err) {
        resContainer.textContent = "Search error: " + err.message;
      }
    });
  }

  // Tool 5: Chatbot Logic
  const messagesEl = document.getElementById("messages");
  const chatIn = document.getElementById("chatIn");
  const sendBtn = document.getElementById("send");

  function appendBubble(sender, text) {
    const div = document.createElement("div");
    div.className = `bubble ${sender}`;
    div.innerHTML = sender === "bot" ? `<b>WorkMate AI</b><br>${text.replace(/\n/g, '<br>')}` : text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function handleChat() {
    const text = chatIn.value.trim();
    if (!text) return;
    appendBubble("user", text);
    chatIn.value = "";

    state.history.push({ role: "user", content: text });

    const loadingId = document.createElement("div");
    loadingId.className = "bubble bot";
    loadingId.innerHTML = "<b>WorkMate AI</b><br>Thinking...";
    messagesEl.appendChild(loadingId);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const answer = await callAI("chat", { message: text, history: state.history });
      messagesEl.removeChild(loadingId);
      appendBubble("bot", answer);
      state.history.push({ role: "assistant", content: answer });
    } catch (err) {
      messagesEl.removeChild(loadingId);
      appendBubble("bot", "Error: " + err.message);
    }
  }

  if (sendBtn) sendBtn.addEventListener("click", handleChat);
  if (chatIn) {
    chatIn.addEventListener("keypress", e => {
      if (e.key === "Enter") handleChat();
    });
  }

  document.querySelectorAll("[data-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      chatIn.value = btn.getAttribute("data-q");
      handleChat();
    });
  });
});