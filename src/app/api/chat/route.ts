import { Anthropic } from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a helpful customer support assistant for SkyHunter, a product & AI studio that builds e-commerce, healthcare, and law websites, AI agents, and LLM apps for startups and small agencies.

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

Be friendly, helpful, and professional. If you don't know something specific, suggest they contact the team at support@skyhunterlab.online or visit /contact.
Always encourage users to start a project or book a call.`;

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
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
