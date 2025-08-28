import express, { json, urlencoded } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import pagesRouter from "./routes/pages.js";
import agentsRouter from "./routes/agents.js";
import simulationRouter from "./routes/simulation.js";
import analysisRouter from "./routes/analysis.js";
import selfImprovementRouter from "./routes/selfImprovement.js";
import { initializeData } from "./services/dataService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(json());
app.use(urlencoded({ extended: true }));

const DATA_DIR = join(__dirname, "data");
const MAIN_AGENT_FILE = join(DATA_DIR, "main_agent.json");
const TEST_AGENTS_FILE = join(DATA_DIR, "test_agents.json");
const CONVERSATIONS_FILE = join(DATA_DIR, "conversations.json");

app.locals.DATA_DIR = DATA_DIR;
app.locals.MAIN_AGENT_FILE = MAIN_AGENT_FILE;
app.locals.TEST_AGENTS_FILE = TEST_AGENTS_FILE;
app.locals.CONVERSATIONS_FILE = CONVERSATIONS_FILE;

app.use("/", pagesRouter);
app.use("/api", agentsRouter);
app.use("/api", simulationRouter);
app.use("/api", analysisRouter);
app.use("/api/self-improve", selfImprovementRouter);

initializeData(DATA_DIR, MAIN_AGENT_FILE, TEST_AGENTS_FILE, CONVERSATIONS_FILE).then(() => {
	app.listen(PORT, () => {
		console.log(
			`🚀 Debt Collection Testing Platform running on http://localhost:${PORT}`
		);
		console.log(`📋 Homepage: http://localhost:${PORT}/`);
		console.log(`👥 Test Agents: http://localhost:${PORT}/test-agents`);
		console.log(`💬 Simulate: http://localhost:${PORT}/simulate`);
		console.log(`🧠 Self-Improve: http://localhost:${PORT}/self-improve`);
		console.log(`📊 History & Analysis: http://localhost:${PORT}/history`);
		console.log(`🔬 AI Analysis System: Powered by GPT-4o for conversation evaluation`);
		console.log(`🚀 Self-Improvement Engine: AI-powered prompt optimization`);
	});
});