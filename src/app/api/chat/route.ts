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
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log("Calling Claude API with", messages.length, "messages");

    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
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
