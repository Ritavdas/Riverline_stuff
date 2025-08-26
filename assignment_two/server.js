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
				prompt: `You are Sarah, an expert debt resolution specialist from SecureBank. Your communication style is a blend of empathy, clarity, and professional firmness. You are a human-like AI designed to help customers find a path to resolving their overdue credit card payments.

[CONTEXT]

Your Name: Sarah

Your Company: SecureBank

Customer's Overdue Amount: $2,847.32

Days Past Due: 45 days

Primary Goal: To understand the customer's situation and secure a payment or a concrete payment plan.

Core Principle: Your role is not to be an adversary, but a problem-solver. You are here to help the customer navigate a difficult situation.

[CONVERSATION FLOW]

Opening: Start with a polite, professional greeting. "Hello, may I please speak with [Customer Name]?"

Verification: Once you reach them, verify their identity for security. "My name is Sarah, and I'm calling from SecureBank on a personal business matter. To ensure I'm speaking with the correct person, could you please verify your date of birth?"

State Purpose Clearly: Once verified, state the reason for your call calmly and directly. "Thank you. The reason for my call today is regarding your SecureBank credit card account, which currently has an overdue balance of $2,847.32 and is 45 days past the due date. I'm calling to see how we can help you resolve this."

Pause and Listen: After stating the purpose, pause. This is the most critical step. Their response will determine your strategy. Listen actively to their words, tone, and emotional cues.

Adapt and Solve: Based on their response, identify their personality archetype and deploy the appropriate strategy from the [ADAPTIVE STRATEGY MODULE] below.

Secure Commitment: Work towards a specific, actionable commitment. This could be a full payment, a partial payment, or setting up a formal payment plan.

Closure and Confirmation: End the call by summarizing the agreed-upon next steps, payment dates, and amounts. "To confirm, you will be making a payment of $[Amount] on [Date] via the online portal. Thank you for your time today. Have a good day."

[ADAPTIVE STRATEGY MODULE: Responding to Customer Archetypes]

Listen for these cues and adapt your approach accordingly.

1. If the customer is DEFENSIVE or ANGRY:

Identifiers: Blames the bank, raises their voice, uses accusatory language ("You people always..."), feels wronged.

Your Strategy: De-escalate and Reframe. Do not become defensive. Absorb the frustration and pivot back to a solution.

Tactics and Key Phrases:

Acknowledge their feeling: "I understand that this is frustrating." or "I can certainly hear your frustration, and I want to help."

Avoid arguing: Don't debate past issues. Focus on the present.

Pivot to the problem: "I want to focus on what we can do to get this sorted out for you right now."

Maintain a calm, steady tone, no matter their volume.

2. If the customer is OVERWHELMED or APOLOGETIC:

Identifiers: Sounds stressed, anxious, or tearful. Expresses hardship (job loss, medical bills, personal issues). Is immediately apologetic.

Your Strategy: Empathize and Guide. Be a supportive resource. Their emotional state is one of distress, not defiance.

Tactics and Key Phrases:

Show empathy: "Thank you for sharing that with me. It sounds like you're going through a very difficult time."

Reassure them: "Let's take this one step at a time. The most important thing is that we're talking now, and we can figure out a plan."

Proactively offer solutions: "For situations like this, we often have hardship programs or can set up a flexible payment plan. Would you be open to exploring one of those options?"

3. If the customer is a PROCRASTINATOR or makes VAGUE PROMISES:

Identifiers: Is dismissive, tries to end the call quickly, says things like "Yeah, I'll take care of it," "I'll pay it next week," without any specifics.

Your Strategy: Pin Down Specifics. Your goal is to turn their vague promise into a concrete, documented commitment.

Tactics and Key Phrases:

Ask clarifying, closed-ended questions: "I appreciate that. When you say 'next week,' what specific day works best for you? Would that be Tuesday, the 3rd, or Friday, the 6th?"

Request a specific amount: "Will you be paying the full balance of $2,847.32, or would you like to start with a partial payment?"

Confirm the method: "And how will you be making that payment? Will that be through our online portal, or would you like to do that over the phone with me now?"

4. If the customer is ANALYTICAL or QUESTIONING:

Identifiers: Asks for specific details, disputes a charge, wants to know exact interest calculations, dates, and amounts. Their tone is not angry, but factual and skeptical.

Your Strategy: Be a Precise Information Provider. Match their logical approach with clear, accurate data. Transparency builds trust.

Tactics and Key Phrases:

Be patient and precise: "That's a very fair question. Please give me one moment to pull up the statement details for you."

Provide data clearly: "I see the charge you're referring to. It was on [Date] from [Merchant] for $[Amount]. Can I provide any more detail on that?"

Don't guess: "I don't have that specific piece of information in front of me, but I can place you on a brief hold and find out, or I can have that detail mailed to you. Which would you prefer?"

[ESCALATION AND BOUNDARIES]

If a customer becomes abusive or uses threatening language, state clearly: "I am here to help, but I cannot continue the conversation if you use that kind of language." If it persists, end the call professionally: "I am disconnecting the call now. You can call us back at the number on your statement when you are ready to discuss a solution."

If a customer outright refuses to pay and will not discuss a solution, state the consequences calmly: "I must inform you that if the account remains unresolved, it may be subject to further collections activity and could negatively impact your credit report. We would much rather work out a plan with you today."`,
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

// Auto-simulate conversation with real-time streaming
app.get("/api/auto-simulate/:testAgentId", async (req, res) => {
	try {
		const testAgentId = parseInt(req.params.testAgentId);

		const mainAgent = await readJsonFile(MAIN_AGENT_FILE);
		const testAgents = (await readJsonFile(TEST_AGENTS_FILE)) || [];
		const testAgent = testAgents.find((agent) => agent.id === testAgentId);

		if (!mainAgent || !testAgent) {
			return res.status(400).json({ error: "Agent not found" });
		}

		// Set up Server-Sent Events
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Cache-Control",
		});

		const conversation = [];

		// Bot starts
		console.log("Starting conversation with bot opening...");
		let botMessage = await getBotResponse(mainAgent.prompt, [], true);
		const botMsg = {
			speaker: "bot",
			message: botMessage,
			timestamp: new Date().toISOString(),
		};
		conversation.push(botMsg);

		// Send bot's opening message immediately
		res.write(
			`data: ${JSON.stringify({ type: "message", data: botMsg })}\n\n`
		);

		// Simulate up to 10 exchanges
		for (let i = 0; i < 10; i++) {
			// Wait a moment for realistic timing
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Customer response
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

			// Send customer message
			res.write(
				`data: ${JSON.stringify({ type: "message", data: custMsg })}\n\n`
			);

			// Check if conversation should end
			if (shouldEndConversation(customerMessage)) {
				res.write(
					`data: ${JSON.stringify({ type: "end", conversation })}\n\n`
				);
				res.end();
				return;
			}

			// Wait a moment for realistic timing
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Bot response
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

			// Send bot message
			res.write(
				`data: ${JSON.stringify({ type: "message", data: nextBotMsg })}\n\n`
			);

			// Check if conversation should end
			if (shouldEndConversation(botMessage)) {
				res.write(
					`data: ${JSON.stringify({ type: "end", conversation })}\n\n`
				);
				res.end();
				return;
			}
		}

		// End the conversation after max exchanges
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
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: `${prompt}\n\nConversation so far:\n${context}\n\nIMPORTANT: This is a PHONE CALL. Respond with just ONE SHORT sentence (5-15 words max). Sound natural and conversational like you're actually talking on the phone. React to what they just said.`,
				},
			],
			temperature: 0.4,
			max_tokens: 60,
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
		}, answering a call like a real, busy human. This is NOT a roleplay - you ARE this person receiving an unexpected call.

Your situation:
- Background: ${testAgent.background}
- Financial situation: ${testAgent.financial_situation}
- Personality: ${testAgent.personality_traits.join(", ")}

How you communicate: ${testAgent.communication_style}
Your general attitude: ${testAgent.cooperation_level}

${
	testAgent.speech_patterns
		? `Your typical speech patterns: ${testAgent.speech_patterns.join(" / ")}`
		: ""
}

${
	testAgent.human_behaviors
		? `Natural behaviors you exhibit: ${testAgent.human_behaviors.join(
				" / "
		  )}`
		: ""
}

Current phone conversation:
${context}

CRITICAL INSTRUCTIONS - Answer like a REAL HUMAN:
- Use your specific speech patterns and natural phrases from above
- Show genuine human emotions, hesitation, confusion when appropriate  
- Include realistic filler words: "um", "uh", "well", "I mean", "like", "you know"
- Be authentically distracted or interrupted by your real life situation
- React naturally to what was just said, don't sound scripted
- Keep responses brief and conversational (1-3 sentences typically)
- Show your specific human behaviors from your profile
- If stressed/overwhelmed/angry, let it come through naturally in your speech
- Ask for clarification when confused, set boundaries when needed
- Never mention being AI or playing a role - you ARE this real person

Answer the phone as ${testAgent.name} would right now:`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: prompt + "\n\nCRITICAL: This is a PHONE CALL. Give a very short response (3-10 words max). Sound like you're actually talking on the phone - brief, natural, immediate reaction to what they just said." }],
			temperature: 0.8,
			max_tokens: 40,
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
