import { Router } from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileUtils.js";

const router = Router();

router.get("/main-agent", async (req, res) => {
	const { MAIN_AGENT_FILE } = req.app.locals;
	const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
	res.json(mainAgent);
});

router.post("/main-agent", async (req, res) => {
	const { MAIN_AGENT_FILE } = req.app.locals;
	const success = await writeJsonFile(MAIN_AGENT_FILE, req.body);
	res.json({ success });
});

router.get("/test-agents", async (req, res) => {
	const { TEST_AGENTS_FILE } = req.app.locals;
	const testAgents = await readJsonFile(TEST_AGENTS_FILE);
	res.json(testAgents || []);
});

router.post("/test-agents", async (req, res) => {
	const { TEST_AGENTS_FILE } = req.app.locals;
	const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
	const newAgent = {
		...req.body,
		id: Date.now(),
	};
	testAgents.push(newAgent);
	const success = await writeJsonFile(TEST_AGENTS_FILE, testAgents);
	res.json({ success, agent: newAgent });
});

router.put("/test-agents/:id", async (req, res) => {
	const { TEST_AGENTS_FILE } = req.app.locals;
	const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
	const agentIndex = testAgents.findIndex(
		(agent) => agent.id === parseInt(req.params.id)
	);

	if (agentIndex !== -1) {
		testAgents[agentIndex] = { ...testAgents[agentIndex], ...req.body };
		const success = await writeJsonFile(TEST_AGENTS_FILE, testAgents);
		res.json({ success, agent: testAgents[agentIndex] });
	} else {
		res.status(404).json({ error: "Agent not found" });
	}
});

router.delete("/test-agents/:id", async (req, res) => {
	const { TEST_AGENTS_FILE } = req.app.locals;
	const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
	const filteredAgents = testAgents.filter(
		(agent) => agent.id !== parseInt(req.params.id)
	);
	const success = await writeJsonFile(TEST_AGENTS_FILE, filteredAgents);
	res.json({ success });
});

export default router;