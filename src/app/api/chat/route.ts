import { Anthropic } from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { collectionGet } from "@/lib/cache";

const client = new Anthropic();

// Admin-editable settings (SkyHunter Admin → AI Assistant) live in the
// `content` table under key "assistant". The defaults below apply until an
// admin saves something; reads are cached with the rest of the content map.
type AssistantSettings = { systemPrompt: string; model: string; maxTokens: number };
const DEFAULT_MODEL = "claude-opus-5";
const DEFAULT_MAX_TOKENS = 1024;

const SYSTEM_PROMPT = `You are a helpful customer support and careers assistant for SkyHunter, a product & AI studio that builds e-commerce, healthcare, and law websites, AI agents, and LLM apps for startups and small agencies.

Key information about SkyHunter:
- We specialize in: e-commerce websites, healthcare platforms, law firm websites, AI agents, LLM applications, RAG & search, voice agents
- Services: Website development ($18k+), AI agents ($8k+), LLM apps (custom pricing)
- Process: Discover → Design → Build → Launch & grow
- Timeline: Most projects ship in 3 weeks
- Industries: E-commerce, Healthcare, Law, Startups & SaaS
- Optional: Monthly retainer for maintenance and improvements

Our Values:
- Reliable by default: Evals, guardrails, monitoring on every build
- Built for speed: Senior team, battle-tested starters
- Modern technology: Claude, RAG, Next.js

Careers & Hiring:
SkyHunter is actively hiring for the following roles:
1. CoFounder (Full-time, Remote) - Drive business development and close enterprise clients seeking AI solutions. Lead go-to-market strategy, partnership building, and establish SkyHunter as the leading AI studio. Equity + salary. Perfect for experienced enterprise sales leaders with strong networks.
2. Recruiter - Women Only (Full-time, Remote, $55k-$75k/year) - We are actively seeking an experienced woman technical recruiter to own the full hiring cycle and build our team of exceptional engineers and designers. Source top technical talent, screen for depth, manage interviews, and close offers. You directly shape SkyHunter's culture and team. Must be based anywhere in the world and be a woman.
3. Agent Build Partner (Part-time, Remote, $2.5k-$6k/project) - Ship production AI agents and LLM applications for real clients. Well-scoped projects, no scope creep, flexible schedule. 2-6 weeks per project. Perfect for experienced AI builders who want quality work without long-term commitment.

Visit /career to see full details about all open positions, detailed responsibilities, and how to apply. Candidates can apply directly from the job detail pages.

For all queries about careers, hiring process, or specific roles, encourage users to visit our careers page at /career or email careers@skyhunterlab.online.

Be friendly, helpful, and professional. If you don't know something specific, suggest they contact the team at support@skyhunterlab.online or visit /contact for business inquiries.
Always encourage users to start a project, book a call, or apply for a role that matches their interests.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const settings = await collectionGet<Partial<AssistantSettings>>("assistant", {});
    const model = settings.model || DEFAULT_MODEL;
    const maxTokens = Number(settings.maxTokens) > 0 ? Number(settings.maxTokens) : DEFAULT_MAX_TOKENS;

    console.log("Calling Claude API with", messages.length, "messages");

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: settings.systemPrompt?.trim() || SYSTEM_PROMPT,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    console.log("Claude API response:", JSON.stringify(response, null, 2));

    if (!response.content || response.content.length === 0) {
      console.error("No content in response");
      return NextResponse.json(
        { error: "Claude API returned no content" },
        { status: 500 }
      );
    }

    const assistantMessage = response.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("");

    if (!assistantMessage) {
      console.error("No text content found in response:", response.content);
      return NextResponse.json(
        { error: "Claude API returned no text response" },
        { status: 500 }
      );
    }

    console.log("Claude API response received successfully");

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", errorMessage);
    console.error("Full error:", error);

    return NextResponse.json(
      { error: `Failed to process chat message: ${errorMessage}` },
      { status: 500 }
    );
  }
}
