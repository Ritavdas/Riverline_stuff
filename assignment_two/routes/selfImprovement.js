import { Router } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fsSync from "fs";
import { readJsonFile } from "../utils/fileUtils.js";
import { runSelfImprovement } from "../services/selfImprovementService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
let improvementSessions = new Map();

router.post("/start", async (req, res) => {
	try {
		const { personalityId, targetScore, maxIterations } = req.body;
		const { DATA_DIR, TEST_AGENTS_FILE, MAIN_AGENT_FILE } = req.app.locals;
		
		if (!personalityId || !targetScore || !maxIterations) {
			return res.json({ success: false, error: "Missing required parameters" });
		}
		
		const testAgents = await readJsonFile(TEST_AGENTS_FILE);
		const testAgent = testAgents.find(agent => agent.id === personalityId);
		if (!testAgent) {
			return res.json({ success: false, error: "Test agent not found" });
		}
		
		const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
		const initialPrompt = mainAgent?.prompt || "You are a debt collection agent.";
		
		const sessionId = Date.now().toString();
		const session = {
			id: sessionId,
			testAgent,
			targetScore: parseFloat(targetScore),
			maxIterations: parseInt(maxIterations),
			currentIteration: 0,
			currentPrompt: initialPrompt,
			originalPrompt: initialPrompt,
			bestScore: 0,
			bestPrompt: initialPrompt,
			iterationHistory: [],
			completed: false,
			success: false,
			startTime: new Date().toISOString(),
			latestChange: "Starting self-improvement process...",
			dataDir: DATA_DIR
		};
		
		improvementSessions.set(sessionId, session);
		
		runSelfImprovement(sessionId, improvementSessions).catch(error => {
			console.error(`Self-improvement session ${sessionId} failed:`, error);
			const session = improvementSessions.get(sessionId);
			if (session) {
				session.completed = true;
				session.error = error.message;
			}
		});
		
		res.json({ success: true, sessionId });
		
	} catch (error) {
		console.error('Error starting self-improvement:', error);
		res.json({ success: false, error: error.message });
	}
});

router.get("/status/:sessionId", (req, res) => {
	const { sessionId } = req.params;
	const session = improvementSessions.get(sessionId);
	
	if (!session) {
		return res.json({ success: false, error: "Session not found" });
	}
	
	res.json({
		success: true,
		currentIteration: session.currentIteration,
		maxIterations: session.maxIterations,
		currentScore: session.bestScore,
		targetScore: session.targetScore,
		completed: session.completed,
		latestChange: session.latestChange,
		iterationHistory: session.iterationHistory,
		originalPrompt: session.completed ? session.originalPrompt : undefined,
		bestPrompt: session.completed ? session.bestPrompt : undefined,
		finalScore: session.completed ? session.bestScore : undefined
	});
});

router.post("/stop", (req, res) => {
	const { sessionId } = req.body;
	const session = improvementSessions.get(sessionId);
	
	if (!session) {
		return res.json({ success: false, error: "Session not found" });
	}
	
	session.completed = true;
	session.stopped = true;
	
	res.json({ success: true });
});

router.get("/history/:agentId", async (req, res) => {
	try {
		const agentId = parseInt(req.params.agentId);
		const { DATA_DIR } = req.app.locals;
		const sessions = [];
		
		const selfImproveDir = join(DATA_DIR, "self_improve");
		if (fsSync.existsSync(selfImproveDir)) {
			const files = fsSync.readdirSync(selfImproveDir);
			
			for (const file of files) {
				if (file.startsWith('session_') && file.endsWith('.json')) {
					try {
						const sessionData = await readJsonFile(join(selfImproveDir, file));
						if (sessionData && sessionData.testAgent && sessionData.testAgent.id === agentId && sessionData.completed) {
							sessions.push({
								id: sessionData.id,
								agentName: sessionData.testAgent.name,
								bestScore: sessionData.bestScore,
								finalScore: sessionData.bestScore,
								originalPrompt: sessionData.originalPrompt,
								bestPrompt: sessionData.bestPrompt,
								iterationHistory: sessionData.iterationHistory || [],
								startTime: sessionData.startTime,
								endTime: sessionData.endTime,
								success: sessionData.success,
								maxIterations: sessionData.maxIterations,
								targetScore: sessionData.targetScore
							});
						}
					} catch (error) {
						console.log(`Error reading session file ${file}:`, error.message);
					}
				}
			}
		}
		
		sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
		
		res.json({ success: true, sessions });
	} catch (error) {
		console.error("Error fetching historical sessions:", error);
		res.json({ success: false, error: error.message });
	}
});

export { improvementSessions };
export default router;