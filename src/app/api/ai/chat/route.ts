import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { tools, executeTool } from '@/lib/ai-agent';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();

    let currentMessages = messages;
    let finalResponse = '';

    // Process tool calls in a loop
    while (true) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: `You are a helpful AI budgeting assistant for SpendSense. You help users understand their spending, create budgets, track goals, and make better financial decisions.

You have access to the user's financial data through tools. Always be helpful, clear, and provide actionable insights.

When analyzing spending, highlight key patterns and provide specific recommendations. When detecting anomalies, explain why they're unusual based on statistical analysis.

Be encouraging about good financial habits and constructive about areas for improvement.`,
        messages: currentMessages,
        tools,
        stream: false,
      });

      // Handle stop reason
      if (response.stop_reason === 'end_turn') {
        // Extract final text content
        for (const block of response.content) {
          if (block.type === 'text') {
            finalResponse += block.text;
          }
        }
        break;
      } else if (response.stop_reason === 'tool_use') {
        // Execute tools
        const toolResults: Anthropic.MessageParam[] = [];

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            try {
              const result = await executeTool(block.name, block.input as Record<string, any>, session.userId);

              toolResults.push({
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: JSON.stringify(result),
                  },
                ],
              });
            } catch (error: any) {
              toolResults.push({
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: `Error: ${error.message}`,
                    is_error: true,
                  },
                ],
              });
            }
          }
        }

        // Add assistant response and tool results to messages
        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant',
            content: response.content,
          },
          ...toolResults,
        ];

        // Continue the loop to get the next response
      } else {
        // Unexpected stop reason
        return Response.json(
          { error: 'Unexpected stop reason' },
          { status: 500 }
        );
      }
    }

    return Response.json({ message: finalResponse });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
