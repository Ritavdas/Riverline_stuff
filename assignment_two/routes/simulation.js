import { Router } from "express";
import { readJsonFile } from "../utils/fileUtils.js";
import { getBotResponse, getCustomerResponse, shouldEndConversation } from "../services/aiService.js";

const router = Router();

router.post("/simulate-conversation", async (req, res) => {
	try {
		const { testAgentId, message, conversationHistory = [] } = req.body;
		const { MAIN_AGENT_FILE, TEST_AGENTS_FILE } = req.app.locals;

		const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
		const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
		const testAgent = testAgents.find((agent) => agent.id === testAgentId);

		if (!mainAgent || !testAgent) {
			return res.status(400).json({ error: "Agent not found" });
		}

		let botResponse;

		if (!message) {
			botResponse = await getBotResponse(mainAgent.prompt, [], true);
			res.json({
				botResponse,
				conversationHistory: [{ speaker: "bot", message: botResponse }],
			});
			return;
		}

		const updatedHistory = [
			...conversationHistory,
			{ speaker: "customer", message },
		];

		botResponse = await getBotResponse(
			mainAgent.prompt,
			updatedHistory,
			false
		);

		const finalHistory = [
			...updatedHistory,
			{ speaker: "bot", message: botResponse },
		];

		res.json({
			botResponse,
			conversationHistory: finalHistory,
		});
	} catch (error) {
		console.error("Simulation error:", error);
		res.status(500).json({ error: "Simulation failed" });
	}
});

router.get("/auto-simulate/:testAgentId", async (req, res) => {
	try {
		const testAgentId = parseInt(req.params.testAgentId);
		const { MAIN_AGENT_FILE, TEST_AGENTS_FILE } = req.app.locals;

		const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
		const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
		const testAgent = testAgents.find((agent) => agent.id === testAgentId);

		if (!mainAgent || !testAgent) {
			return res.status(400).json({ error: "Agent not found" });
		}

		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Cache-Control",
		});

		const conversation = [];

		console.log("Starting conversation with bot opening...");
		let botMessage = await getBotResponse(mainAgent.prompt, [], true);
		const botMsg = {
			speaker: "bot",
			message: botMessage,
			timestamp: new Date().toISOString(),
		};
		conversation.push(botMsg);

		res.write(
			`data: ${JSON.stringify({ type: "message", data: botMsg })}\n\n`
		);

		for (let i = 0; i < 10; i++) {
			await new Promise((resolve) => setTimeout(resolve, 2000));

			console.log(`Getting customer response ${i + 1}...`);
			const customerMessage = await getCustomerResponse(
				testAgent,
				conversation
			);
			const custMsg = {
				speaker: "customer",
				message: customerMessage,
				timestamp: new Date().toISOString(),
			};
			conversation.push(custMsg);

			res.write(
				`data: ${JSON.stringify({ type: "message", data: custMsg })}\n\n`
			);

			if (shouldEndConversation(customerMessage)) {
				res.write(
					`data: ${JSON.stringify({ type: "end", conversation })}\n\n`
				);
				res.end();
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 2000));

			console.log(`Getting bot response ${i + 1}...`);
			botMessage = await getBotResponse(
				mainAgent.prompt,
				conversation,
				false
			);
			const nextBotMsg = {
				speaker: "bot",
				message: botMessage,
				timestamp: new Date().toISOString(),
			};
			conversation.push(nextBotMsg);

			res.write(
				`data: ${JSON.stringify({ type: "message", data: nextBotMsg })}\n\n`
			);

			if (shouldEndConversation(botMessage)) {
				res.write(
					`data: ${JSON.stringify({ type: "end", conversation })}\n\n`
				);
				res.end();
				return;
			}
		}

		res.write(`data: ${JSON.stringify({ type: "end", conversation })}\n\n`);
		res.end();
	} catch (error) {
		console.error("Auto simulation error:", error);
		res.write(
			`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
		);
		res.end();
	}
});

export default router;