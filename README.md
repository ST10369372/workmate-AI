# WorkMate AI — Real ChatGPT / Gemini Backend

This version keeps the HTML/CSS/JS frontend and adds a small Node.js backend so API keys stay on the server.

## 1. Install Node.js
Use a current LTS version of Node.js.

## 2. Install dependencies
From this folder:

```bash
npm install
```

## 3. Configure API keys
Copy `.env.example` to `.env`.

For OpenAI:
```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5
```

For Gemini:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.6-flash
```

You can configure one or both providers.

## 4. Start
```bash
npm start
```

Open:
http://localhost:3000

## 5. Select provider
In the AI Chatbot page, choose:
- ChatGPT / OpenAI
- Google Gemini

The email, meeting, task, research and chatbot workflows send requests to `/api/generate`.

## Security
- API keys are read from environment variables.
- `.env` is ignored by Git.
- Keys are never placed in browser JavaScript.
- The backend uses `store: false` for OpenAI Responses API calls.
- For production, add authentication, rate limiting, input limits, logging controls and HTTPS.

## If you do not configure an API key
The original local/demo logic remains in the frontend, but real-AI buttons will report that the backend/provider is unavailable.

## Notion integration

WorkMate can now use Notion as its workplace knowledge/output layer.

1. Create a Notion integration at `https://www.notion.so/my-integrations` and copy its secret.
2. Share the Notion parent page you want WorkMate to use with that integration.
3. Put the integration secret in `.env` as `NOTION_TOKEN`.
4. Put the parent page ID in `.env` as `NOTION_PARENT_PAGE_ID`.
5. Restart with `npm start`.

The Research Assistant can search Notion, and Email, Meeting, Task and Research outputs can be saved into Notion as new pages. API credentials remain server-side.
