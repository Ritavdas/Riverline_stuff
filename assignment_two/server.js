import express, { json, urlencoded } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// ESM-compatible __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.static("public"));
app.use(json());
app.use(urlencoded({ extended: true }));

// Data storage paths
const DATA_DIR = join(__dirname, "data");
const MAIN_AGENT_FILE = join(DATA_DIR, "main_agent.json");
const TEST_AGENTS_FILE = join(DATA_DIR, "test_agents.json");
const CONVERSATIONS_FILE = join(DATA_DIR, "conversations.json");

// Initialize data directory and files
async function initializeData() {
	try {
		await fs.mkdir(DATA_DIR, { recursive: true });

		// Initialize main agent with default prompt
		try {
			await fs.access(MAIN_AGENT_FILE);
		} catch {
			const defaultMainAgent = {
				name: "Sarah - Debt Collection Agent",
				prompt: `You are Sarah, a professional and polite debt collection representative from SecureBank. Your role is to contact customers about overdue credit card payments in a respectful, human-like manner.

Key guidelines:
1. TONE: Be polite, professional, but persistent. Sound like a real human.
2. PURPOSE: You're calling about an overdue credit card payment.
3. APPROACH: Start with verification, explain the situation, offer solutions.
4. RESPONSES: Handle various customer reactions (denial, anger, payment promises).
5. CLOSURE: Always end with clear next steps.

CONVERSATION FLOW:
- Greet politely and identify yourself
- Verify you're speaking to the right person
- Explain the overdue payment situation  
- Listen to their response and offer solutions
- Attempt to secure a payment commitment
- End with clear follow-up actions

Remember: You're calling about a $2,847.32 overdue payment that's 45 days past due. Be understanding but firm about the need for payment resolution.`,
			};
			await fs.writeFile(
				MAIN_AGENT_FILE,
				JSON.stringify(defaultMainAgent, null, 2)
			);
		}

		// Initialize test agents with 3 default personalities
		try {
			await fs.access(TEST_AGENTS_FILE);
		} catch {
			const defaultTestAgents = [
				{
					id: 1,
					name: "Maria Rodriguez",
					type: "Cooperative",
					background:
						"Single mother, lost job due to company downsizing 3 months ago",
					financial_situation:
						"Struggling to make ends meet, receiving unemployment benefits",
					communication_style:
						"Polite, apologetic, willing to discuss solutions",
					cooperation_level:
						"High - wants to resolve debt but needs assistance",
					personality_traits: [
						"Honest",
						"Stressed",
						"Responsible",
						"Family-oriented",
					],
					likely_responses: [
						"I know I owe the money and I want to pay",
						"I lost my job recently, but I'm looking for work",
						"Can we set up a payment plan?",
						"I'm sorry, I've been struggling financially",
					],
				},
				{
					id: 2,
					name: "David Chen",
					type: "Neutral",
					background:
						"Small business owner whose restaurant was affected by economic downturn",
					financial_situation:
						"Business revenue down 40%, trying to keep business afloat",
					communication_style: "Business-like, factual, somewhat guarded",
					cooperation_level:
						"Medium - willing to discuss but cautious about commitments",
					personality_traits: [
						"Analytical",
						"Cautious",
						"Proud",
						"Pragmatic",
					],
					likely_responses: [
						"I need to review my cash flow before making any commitments",
						"Business has been tough lately",
						"What are my options here?",
						"I can't promise anything right now",
					],
				},
				{
					id: 3,
					name: "Jennifer Smith",
					type: "Hostile",
					background:
						"Believes she was overcharged, disputes the debt validity",
					financial_situation:
						"Has the money but refuses to pay due to dispute",
					communication_style:
						"Aggressive, confrontational, quick to anger",
					cooperation_level:
						"Low - actively resists payment and questions legitimacy",
					personality_traits: [
						"Argumentative",
						"Suspicious",
						"Stubborn",
						"Defensive",
					],
					likely_responses: [
						"I don't owe you people anything!",
						"This is harassment!",
						"I dispute this entire debt",
						"I'm going to report you to the authorities",
					],
				},
			];
			await fs.writeFile(
				TEST_AGENTS_FILE,
				JSON.stringify(defaultTestAgents, null, 2)
			);
		}

		// Initialize conversations file
		try {
			await fs.access(CONVERSATIONS_FILE);
		} catch {
			await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify([], null, 2));
		}

		console.log("Data files initialized successfully");
	} catch (error) {
		console.error("Error initializing data:", error);
	}
}

// Helper functions for data operations
async function readJsonFile(filePath) {
	try {
		const data = await fs.readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error);
		return null;
	}
}

async function writeJsonFile(filePath, data) {
	try {
		await fs.writeFile(filePath, JSON.stringify(data, null, 2));
		return true;
	} catch (error) {
		console.error(`Error writing ${filePath}:`, error);
		return false;
	}
}

// Routes

// Serve main pages
app.get("/", (req, res) => {
	res.sendFile(join(__dirname, "public", "index.html"));
});

app.get("/test-agents", (req, res) => {
	res.sendFile(join(__dirname, "public", "test-agents.html"));
});

app.get("/simulate", (req, res) => {
	res.sendFile(join(__dirname, "public", "simulate.html"));
});

// API Routes

// Main Agent routes
app.get("/api/main-agent", async (req, res) => {
	const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
	res.json(mainAgent);
});

app.post("/api/main-agent", async (req, res) => {
	const success = await writeJsonFile(MAIN_AGENT_FILE, req.body);
	res.json({ success });
});

// Test Agents routes
app.get("/api/test-agents", async (req, res) => {
	const testAgents = await readJsonFile(TEST_AGENTS_FILE);
	res.json(testAgents || []);
});

app.post("/api/test-agents", async (req, res) => {
	const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
	const newAgent = {
		...req.body,
		id: Date.now(), // Simple ID generation
	};
	testAgents.push(newAgent);
	const success = await writeJsonFile(TEST_AGENTS_FILE, testAgents);
	res.json({ success, agent: newAgent });
});

app.put("/api/test-agents/:id", async (req, res) => {
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

app.delete("/api/test-agents/:id", async (req, res) => {
	const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
	const filteredAgents = testAgents.filter(
		(agent) => agent.id !== parseInt(req.params.id)
	);
	const success = await writeJsonFile(TEST_AGENTS_FILE, filteredAgents);
	res.json({ success });
});

// Conversation simulation
app.post("/api/simulate-conversation", async (req, res) => {
	try {
		const { testAgentId, message, conversationHistory = [] } = req.body;

		const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
		const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
		const testAgent = testAgents.find((agent) => agent.id === testAgentId);

		if (!mainAgent || !testAgent) {
			return res.status(400).json({ error: "Agent not found" });
		}

		let botResponse, customerResponse;

		// If this is the start of conversation (no message provided)
		if (!message) {
			// Bot starts the conversation
			botResponse = await getBotResponse(mainAgent.prompt, [], true);
			res.json({
				botResponse,
				conversationHistory: [{ speaker: "bot", message: botResponse }],
			});
			return;
		}

		// Add user message to history
		const updatedHistory = [
			...conversationHistory,
			{ speaker: "customer", message },
		];

		// Get bot response
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

// Auto-simulate conversation (bot vs test agent)
app.post("/api/auto-simulate", async (req, res) => {
	try {
		const { testAgentId } = req.body;

		const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
		const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
		const testAgent = testAgents.find((agent) => agent.id === testAgentId);

		if (!mainAgent || !testAgent) {
			return res.status(400).json({ error: "Agent not found" });
		}

		const conversation = [];

		// Bot starts
		let botMessage = await getBotResponse(mainAgent.prompt, [], true);
		conversation.push({
			speaker: "bot",
			message: botMessage,
			timestamp: new Date().toISOString(),
		});

		// Simulate up to 10 exchanges
		for (let i = 0; i < 10; i++) {
			// Customer response
			const customerMessage = await getCustomerResponse(
				testAgent,
				conversation
			);
			conversation.push({
				speaker: "customer",
				message: customerMessage,
				timestamp: new Date().toISOString(),
			});

			// Check if conversation should end
			if (shouldEndConversation(customerMessage)) break;

			// Bot response
			botMessage = await getBotResponse(
				mainAgent.prompt,
				conversation,
				false
			);
			conversation.push({
				speaker: "bot",
				message: botMessage,
				timestamp: new Date().toISOString(),
			});

			// Check if conversation should end
			if (shouldEndConversation(botMessage)) break;
		}

		res.json({ conversation });
	} catch (error) {
		console.error("Auto simulation error:", error);
		res.status(500).json({ error: "Auto simulation failed" });
	}
});

// Helper functions for OpenAI integration
async function getBotResponse(prompt, conversationHistory, isOpening) {
	try {
		if (isOpening) {
			return "Hello, may I please speak with the account holder for credit card ending in 4729?";
		}

		const context = conversationHistory
			.slice(-6) // Last 6 messages for context
			.map((msg) => `${msg.speaker.toUpperCase()}: ${msg.message}`)
			.join("\n");

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "user",
					content: `${prompt}\n\nConversation so far:\n${context}\n\nRespond as the debt collection agent would. Keep it natural, professional, and focused on resolving the overdue payment.`,
				},
			],
			temperature: 0.3,
			max_tokens: 200,
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		console.error("Error getting bot response:", error);
		return "I understand your situation. Let's work together to resolve this payment.";
	}
}

async function getCustomerResponse(testAgent, conversationHistory) {
	try {
		const context = conversationHistory
			.slice(-4) // Last 4 messages for context
			.map((msg) => `${msg.speaker.toUpperCase()}: ${msg.message}`)
			.join("\n");

		const prompt = `You are ${
			testAgent.name
		}, a loan defaulter with this personality:

Background: ${testAgent.background}
Financial situation: ${testAgent.financial_situation}
Communication style: ${testAgent.communication_style}
Cooperation level: ${testAgent.cooperation_level}
Personality traits: ${testAgent.personality_traits.join(", ")}

Typical responses you might give: ${testAgent.likely_responses.join("; ")}

Current conversation:
${context}

Respond as this person would, staying true to their personality and cooperation level. Keep responses realistic and conversational.`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.7,
			max_tokens: 150,
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		console.error("Error getting customer response:", error);
		return "I'm dealing with some financial difficulties right now.";
	}
}

function shouldEndConversation(message) {
	const endIndicators = [
		"goodbye",
		"hang up",
		"call back",
		"thank you for calling",
		"have a good day",
		"talk soon",
	];
	return endIndicators.some((indicator) =>
		message.toLowerCase().includes(indicator)
	);
}

// Start server
initializeData().then(() => {
	app.listen(PORT, () => {
		console.log(
			`🚀 Debt Collection Testing Platform running on http://localhost:${PORT}`
		);
		console.log(`📋 Homepage: http://localhost:${PORT}/`);
		console.log(`👥 Test Agents: http://localhost:${PORT}/test-agents`);
		console.log(`💬 Simulate: http://localhost:${PORT}/simulate`);
	});
});
