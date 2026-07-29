const storybookUrl = new URL(
  process.env.STORYBOOK_URL ?? "http://localhost:6006"
);

const requiredStoryIds = [
  "components-input--interaction-anatomy",
  "components-input--cursor-areas",
  "components-input--hit-areas",
  "components-input--floating-label-geometry",
  "components-input--floating-label-md-reference",
  "components-passwordinput--cursor-areas",
  "components-passwordinput--toggle-hit-area",
  "components-passwordinput--inner-label"
];

const requiredToolNames = [
  "get_ui_building_instructions",
  "get_story_urls"
];

function endpoint(pathname) {
  return new URL(pathname, storybookUrl);
}

async function fetchOrExplain(url, init) {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw new Error(
      `Storybook is unavailable at ${storybookUrl}. Start it with "npm run storybook".`,
      { cause: error }
    );
  }
}

function parseMcpResponse(responseText) {
  const dataLines = responseText
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim());

  if (dataLines.length > 0) {
    return JSON.parse(dataLines.join("\n"));
  }

  return JSON.parse(responseText);
}

async function postMcp(message, sessionId) {
  const headers = {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json"
  };

  if (sessionId) {
    headers["Mcp-Session-Id"] = sessionId;
  }

  const response = await fetchOrExplain(endpoint("/mcp"), {
    method: "POST",
    headers,
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    throw new Error(
      `MCP request failed with ${response.status}: ${await response.text()}`
    );
  }

  return response;
}

const indexResponse = await fetchOrExplain(endpoint("/index.json"));
if (!indexResponse.ok) {
  throw new Error(
    `Storybook index request failed with ${indexResponse.status}.`
  );
}

const storyIndex = await indexResponse.json();
const storyIds = new Set(Object.keys(storyIndex.entries ?? {}));
const missingStories = requiredStoryIds.filter((id) => !storyIds.has(id));

if (missingStories.length > 0) {
  throw new Error(`Missing canonical stories: ${missingStories.join(", ")}`);
}

const initializeResponse = await postMcp({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: {
      name: "design-system-storybook-mcp-check",
      version: "1.0.0"
    }
  }
});

const sessionId = initializeResponse.headers.get("mcp-session-id");
if (!sessionId) {
  throw new Error("MCP initialize response did not provide a session ID.");
}

const initializeResult = parseMcpResponse(await initializeResponse.text());
if (!initializeResult.result?.serverInfo) {
  throw new Error("MCP initialize response did not include server info.");
}

await postMcp(
  {
    jsonrpc: "2.0",
    method: "notifications/initialized"
  },
  sessionId
);

const toolsResponse = await postMcp(
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  },
  sessionId
);
const toolsResult = parseMcpResponse(await toolsResponse.text());
const toolNames = new Set(
  (toolsResult.result?.tools ?? []).map((tool) => tool.name)
);
const missingTools = requiredToolNames.filter((name) => !toolNames.has(name));

if (missingTools.length > 0) {
  throw new Error(`Missing Storybook MCP tools: ${missingTools.join(", ")}`);
}

console.log(
  `Storybook MCP is ready at ${endpoint("/mcp")} (${requiredStoryIds.length} canonical stories, ${requiredToolNames.length} tools).`
);
