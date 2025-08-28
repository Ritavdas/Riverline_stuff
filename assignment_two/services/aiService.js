import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function getBotResponse(prompt, conversationHistory, isOpening) {
	try {
		if (isOpening) {
			return "Hello, may I please speak with the account holder for credit card ending in 4729?";
		}

		const context = conversationHistory
			.slice(-6)
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

export async function getCustomerResponse(testAgent, conversationHistory) {
	try {
		const context = conversationHistory
			.slice(-4)
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
			messages: [
				{
					role: "user",
					content:
						prompt +
						"\n\nCRITICAL: This is a PHONE CALL. Give a very short response (3-10 words max). Sound like you're actually talking on the phone - brief, natural, immediate reaction to what they just said.",
				},
			],
			temperature: 0.8,
			max_tokens: 40,
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		console.error("Error getting customer response:", error);
		return "I'm dealing with some financial difficulties right now.";
	}
}

export function shouldEndConversation(message) {
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
