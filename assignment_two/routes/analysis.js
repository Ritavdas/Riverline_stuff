import { Router } from "express";
import { analyzeConversationMetrics, saveConversationAnalysis, getConversationHistory } from "../services/analysisService.js";

const router = Router();

router.post("/analyze-conversation", async (req, res) => {
	try {
		const { conversation, testAgent } = req.body;
		
		if (!conversation || !testAgent) {
			return res.status(400).json({ error: "Missing conversation or test agent data" });
		}
		
		console.log('Starting conversation analysis...');
		
		const analysis = await analyzeConversationMetrics(conversation, testAgent);
		
		const analysisResult = {
			conversationId: `analysis_${Date.now()}`,
			timestamp: new Date().toISOString(),
			testAgent: testAgent,
			conversation: conversation,
			metrics: analysis.metrics,
			overallScore: analysis.overallScore,
			recommendations: analysis.recommendations,
			strengths: analysis.strengths,
			improvements: analysis.improvements
		};
		
		await saveConversationAnalysis(analysisResult);
		
		res.json({
			success: true,
			analysis: analysisResult
		});
		
	} catch (error) {
		console.error("Analysis error:", error);
		res.status(500).json({ error: "Analysis failed: " + error.message });
	}
});

router.get("/conversation-history", async (req, res) => {
	try {
		const history = await getConversationHistory();
		res.json(history);
	} catch (error) {
		console.error("Error fetching conversation history:", error);
		res.status(500).json({ error: "Failed to fetch conversation history" });
	}
});

export default router;