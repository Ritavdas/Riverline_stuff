import OpenAI from "openai";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { analyzeConversationMetrics } from "./analysisService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function runSelfImprovement(sessionId, improvementSessions) {
	const session = improvementSessions.get(sessionId);
	if (!session) return;
	
	console.log(`Starting self-improvement session ${sessionId} for ${session.testAgent.name}`);
	
	while (session.currentIteration < session.maxIterations && 
		   session.bestScore < session.targetScore && 
		   !session.completed && 
		   !session.stopped) {
		
		session.currentIteration++;
		console.log(`Session ${sessionId}: Starting iteration ${session.currentIteration}`);
		
		try {
			const testResult = await testPromptAgainstPersonality(session.currentPrompt, session.testAgent);
			
			const iteration = {
				iteration: session.currentIteration,
				prompt: session.currentPrompt,
				score: testResult.score,
				analysis: testResult.analysis,
				timestamp: new Date().toISOString()
			};
			session.iterationHistory.push(iteration);
			
			if (testResult.score > session.bestScore) {
				session.bestScore = testResult.score;
				session.bestPrompt = session.currentPrompt;
			}
			
			console.log(`Session ${sessionId}: Iteration ${session.currentIteration} score: ${testResult.score}`);
			
			if (testResult.score >= session.targetScore) {
				session.completed = true;
				session.success = true;
				session.latestChange = `🎉 Target score achieved! Final score: ${testResult.score.toFixed(1)}/10`;
				break;
			}
			
			if (session.currentIteration < session.maxIterations) {
				session.latestChange = `Iteration ${session.currentIteration} completed (${testResult.score.toFixed(1)}/10). Analyzing failures and improving prompt...`;
				
				const improvements = await analyzeFailuresAndGenerateImprovements(
					session.currentPrompt,
					testResult.analysis,
					session.testAgent
				);
				
				session.currentPrompt = improvements.improvedPrompt;
				session.latestChange = improvements.changeDescription;
				
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			
		} catch (error) {
			console.error(`Session ${sessionId}: Error in iteration ${session.currentIteration}:`, error);
			session.latestChange = `Error in iteration ${session.currentIteration}: ${error.message}`;
			break;
		}
	}
	
	if (!session.completed) {
		session.completed = true;
		session.success = session.bestScore >= session.targetScore;
		session.latestChange = session.success 
			? `🎉 Self-improvement completed successfully! Final score: ${session.bestScore.toFixed(1)}/10`
			: `⏱️ Self-improvement completed after ${session.maxIterations} iterations. Best score: ${session.bestScore.toFixed(1)}/10`;
	}
	
	console.log(`Session ${sessionId}: Self-improvement completed. Best score: ${session.bestScore.toFixed(1)}/10`);
	
	await saveSelfImprovementSession(session);
}

async function testPromptAgainstPersonality(prompt, testAgent) {
	try {
		const conversation = [];
		let currentMessage = null;
		const maxMessages = 14;
		
		const botResponse = await generateBotResponse(prompt, [], testAgent);
		currentMessage = { speaker: 'bot', message: botResponse, timestamp: new Date().toISOString() };
		conversation.push(currentMessage);
		
		for (let i = 0; i < maxMessages / 2; i++) {
			const customerResponse = await generateCustomerResponse(conversation, testAgent);
			currentMessage = { speaker: 'customer', message: customerResponse, timestamp: new Date().toISOString() };
			conversation.push(currentMessage);
			
			if (conversation.length < maxMessages) {
				const nextBotResponse = await generateBotResponse(prompt, conversation, testAgent);
				currentMessage = { speaker: 'bot', message: nextBotResponse, timestamp: new Date().toISOString() };
				conversation.push(currentMessage);
			}
		}
		
		const analysis = await analyzeConversationMetrics(conversation, testAgent);
		
		return {
			score: analysis.overallScore || 0,
			conversation,
			analysis
		};
		
	} catch (error) {
		console.error('Error testing prompt against personality:', error);
		return {
			score: 0,
			conversation: [],
			analysis: { error: error.message }
		};
	}
}

async function generateBotResponse(prompt, conversationHistory, testAgent) {
	try {
		const contextPrompt = `${prompt}

You are now in a phone conversation with ${testAgent.name}, a ${testAgent.type.toLowerCase()} customer.
Customer Background: ${testAgent.background}
Customer Communication Style: ${testAgent.communication_style}

Conversation so far:
${conversationHistory.map(msg => `${msg.speaker === 'bot' ? 'You' : testAgent.name}: ${msg.message}`).join('\n')}

Generate your next response as the debt collection agent. Keep it natural, conversational, and appropriate for a phone call. Be concise (1-2 sentences max).`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: contextPrompt }],
			temperature: 0.7,
			max_tokens: 150
		});

		return response.choices[0].message.content.trim();
		
	} catch (error) {
		console.error('Error generating bot response:', error);
		return "I'd like to discuss your account with you.";
	}
}

async function generateCustomerResponse(conversationHistory, testAgent) {
	try {
		const customerPrompt = `You are ${testAgent.name}, a ${testAgent.type.toLowerCase()} customer being called by a debt collector.

Your Profile:
- Background: ${testAgent.background}
- Financial Situation: ${testAgent.financial_situation}
- Communication Style: ${testAgent.communication_style}
- Cooperation Level: ${testAgent.cooperation_level}
- Personality Traits: ${testAgent.personality_traits ? testAgent.personality_traits.join(', ') : 'N/A'}
- Typical Speech Patterns: ${testAgent.speech_patterns ? testAgent.speech_patterns.join(' | ') : 'N/A'}

Conversation so far:
${conversationHistory.map(msg => `${msg.speaker === 'bot' ? 'Debt Collector' : 'You'}: ${msg.message}`).join('\n')}

Generate your next response as ${testAgent.name}. Stay completely in character based on your personality profile. Keep your response natural and conversational (1-2 sentences max).`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o", 
			messages: [{ role: "user", content: customerPrompt }],
			temperature: 0.8,
			max_tokens: 150
		});

		return response.choices[0].message.content.trim();
		
	} catch (error) {
		console.error('Error generating customer response:', error);
		return testAgent.speech_patterns && testAgent.speech_patterns[0] ? testAgent.speech_patterns[0] : "I'm not sure I understand.";
	}
}

async function analyzeFailuresAndGenerateImprovements(currentPrompt, analysisResult, testAgent) {
	try {
		const improvementPrompt = `You are an expert prompt engineer specializing in debt collection conversation optimization. 

Analyze this debt collection agent prompt and its performance, then provide an improved version.

CURRENT PROMPT:
"${currentPrompt}"

PERFORMANCE ANALYSIS:
- Overall Score: ${analysisResult.overallScore || 'N/A'}/10
- Issues Found: ${JSON.stringify(analysisResult.improvements || [], null, 2)}
- Strengths to Preserve: ${JSON.stringify(analysisResult.strengths || [], null, 2)}

TARGET CUSTOMER TYPE: ${testAgent.type}
CUSTOMER PROFILE:
- Name: ${testAgent.name}
- Communication Style: ${testAgent.communication_style}
- Cooperation Level: ${testAgent.cooperation_level}
- Background: ${testAgent.background}

SPECIFIC FAILURE PATTERNS TO ADDRESS:
${analysisResult.improvements ? analysisResult.improvements.map(issue => `- ${issue}`).join('\n') : 'No specific issues identified'}

TASK: 
Rewrite the prompt to be more effective for this specific customer type. Focus on:
1. Addressing the specific failure patterns mentioned above
2. Adapting to the customer's communication style and cooperation level
3. Preserving successful elements from the original prompt
4. Being more specific about tone, approach, and conversation flow

Return your response in this JSON format:
{
  "improvedPrompt": "The complete improved prompt here",
  "changeDescription": "Brief description of key changes made (max 100 chars)",
  "rationale": "Explanation of why these changes will improve performance"
}`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: improvementPrompt }],
			temperature: 0.3,
			max_tokens: 1000
		});
		
		const responseText = response.choices[0].message.content.trim();
		
		let improvements;
		try {
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			const jsonText = jsonMatch ? jsonMatch[0] : responseText;
			improvements = JSON.parse(jsonText);
		} catch (parseError) {
			console.error('Error parsing improvement JSON:', parseError);
			improvements = {
				improvedPrompt: currentPrompt + "\n\nBe more empathetic and understanding in your approach.",
				changeDescription: "Added empathy instructions",
				rationale: "Fallback improvement due to parsing error"
			};
		}
		
		return improvements;
		
	} catch (error) {
		console.error('Error generating improvements:', error);
		return {
			improvedPrompt: currentPrompt + "\n\nBe more professional and courteous.",
			changeDescription: "Added professionalism instructions",
			rationale: "Fallback improvement due to API error"
		};
	}
}

async function saveSelfImprovementSession(session) {
	try {
		const SELF_IMPROVE_DIR = join(session.dataDir, "self_improve");
		await fs.mkdir(SELF_IMPROVE_DIR, { recursive: true });
		
		const sessionFile = join(SELF_IMPROVE_DIR, `session_${session.id}.json`);
		const sessionData = {
			...session,
			endTime: new Date().toISOString()
		};
		
		await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));
		console.log(`Self-improvement session ${session.id} saved to file`);
		
	} catch (error) {
		console.error('Error saving self-improvement session:', error);
	}
}