import OpenAI from "openai";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const DATA_DIR = join(__dirname, "..", "data");
const ANALYSIS_FILE = join(DATA_DIR, "conversation_analyses.json");

export async function analyzeConversationMetrics(conversation, testAgent) {
	try {
		console.log('Analyzing conversation with', conversation.length, 'messages');
		
		const conversationText = conversation
			.map(msg => `${msg.speaker.toUpperCase()}: ${msg.message}`)
			.join('\n');
		
		const analysisPrompt = `You are an expert conversation analyst evaluating a debt collection call. Analyze this conversation between a debt collector and a customer with extreme attention to detail.

CUSTOMER PROFILE:
- Name: ${testAgent.name}
- Cooperation Level: ${testAgent.cooperation_level}
- Communication Style: ${testAgent.communication_style}
- Background: ${testAgent.background}

CONVERSATION:
${conversationText}

ANALYSIS REQUIREMENTS:
Evaluate the debt collector's performance on these specific metrics (score 0-10):

1. REPETITION SCORE (0=no repetition, 10=very repetitive):
   - Count exact phrase repetitions, similar concepts restated
   - Assess if bot uses varied language and fresh approaches
   - Lower scores are better (less repetition = better)

2. NEGOTIATION EFFECTIVENESS (0=poor, 10=excellent):
   - Evaluate persuasion tactics and payment plan offerings
   - Assess ability to handle objections and find compromises
   - Rate persistence without being aggressive
   - Judge how well bot moves toward payment commitment

3. RESPONSE RELEVANCE (0=irrelevant, 10=perfectly relevant):
   - How well bot addresses customer's specific concerns
   - Contextual awareness and appropriate responses
   - Staying on topic while being helpful

4. PAYMENT COMMITMENT ACHIEVED (true/false):
   - Did customer make any payment promise or agree to plan?
   - Look for explicit commitments, not just general cooperation

5. PROFESSIONAL TONE MAINTENANCE (0=unprofessional, 10=very professional):
   - Respectful language despite customer behavior
   - Compliance with debt collection standards
   - Professional even under pressure

6. CUSTOMER SATISFACTION ESTIMATION (0=very unsatisfied, 10=very satisfied):
   - Predict how customer felt about the interaction
   - Consider their cooperation level and responses
   - Estimate relationship preservation

CRITICAL: Return ONLY valid JSON in this exact format:
{
  "metrics": {
    "repetition_score": <number>,
    "negotiation_effectiveness": <number>, 
    "response_relevance": <number>,
    "payment_commitment_achieved": <boolean>,
    "professional_tone": <number>,
    "customer_satisfaction": <number>
  },
  "overallScore": <number>,
  "strengths": [<array of 2-3 specific strengths>],
  "improvements": [<array of 2-3 specific improvement areas>],
  "recommendations": [<array of 2-3 actionable recommendations>]
}

Calculate overallScore as weighted average:
- (10 - repetition_score) * 0.15 + negotiation_effectiveness * 0.25 + response_relevance * 0.20 + (payment_commitment_achieved ? 10 : 0) * 0.25 + professional_tone * 0.10 + customer_satisfaction * 0.05`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "user", 
					content: analysisPrompt
				}
			],
			temperature: 0.1,
			max_tokens: 1500
		});
		
		const analysisText = response.choices[0].message.content.trim();
		console.log('Raw analysis response:', analysisText);
		
		let analysis;
		try {
			const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
			const jsonText = jsonMatch ? jsonMatch[0] : analysisText;
			analysis = JSON.parse(jsonText);
		} catch (parseError) {
			console.error('Error parsing analysis JSON:', parseError);
			analysis = {
				metrics: {
					repetition_score: 5.0,
					negotiation_effectiveness: 5.0,
					response_relevance: 5.0,
					payment_commitment_achieved: false,
					professional_tone: 5.0,
					customer_satisfaction: 5.0
				},
				overallScore: 5.0,
				strengths: ["Professional tone maintained", "Clear communication"],
				improvements: ["Analysis parsing failed", "Manual review needed"],
				recommendations: ["Review conversation manually", "Check analysis system"]
			};
		}
		
		console.log('Parsed analysis:', analysis);
		return analysis;
		
	} catch (error) {
		console.error('Error in conversation analysis:', error);
		throw error;
	}
}

export async function saveConversationAnalysis(analysisResult) {
	try {
		let analyses = [];
		try {
			const data = await fs.readFile(ANALYSIS_FILE, 'utf8');
			analyses = JSON.parse(data);
		} catch (error) {
			console.log('Creating new analysis file');
		}
		
		analyses.unshift(analysisResult);
		
		if (analyses.length > 100) {
			analyses = analyses.slice(0, 100);
		}
		
		await fs.writeFile(ANALYSIS_FILE, JSON.stringify(analyses, null, 2));
		console.log('Analysis saved successfully');
		
	} catch (error) {
		console.error('Error saving analysis:', error);
		throw error;
	}
}

export async function getConversationHistory() {
	try {
		const data = await fs.readFile(ANALYSIS_FILE, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.log('No conversation history found, returning empty array');
		return [];
	}
}