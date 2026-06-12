import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure route for larger file uploads and longer execution time
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file processing

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const fileType = isPDF ? 'PDF' : 'CSV';

    // Prepare message content based on file type
    let messageContent: Anthropic.MessageParam['content'];

    if (isPDF) {
      // For PDF: Convert to base64 and use document vision
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');

      messageContent = [
        {
          type: 'document' as const,
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64,
          },
        } as any,
        {
          type: 'text',
          text: `You are a financial transaction parser. Parse this PDF bank statement and extract all transactions.

For each transaction, extract:
- date (in ISO format YYYY-MM-DD)
- description (string)
- amount (positive number)
- type (either "income" or "expense" - determine from context, debits/withdrawals/purchases are expenses, credits/deposits are income)

Return ONLY a valid JSON array of transactions, nothing else. Example format:
[
  {
    "date": "2024-01-15",
    "description": "Grocery Store",
    "amount": 45.67,
    "type": "expense"
  }
]`,
        },
      ];
    } else {
      // For CSV: Send as text
      const fileContent = await file.text();
      messageContent = `You are a financial transaction parser. Parse the following CSV content and extract all transactions.

For each transaction, extract:
- date (in ISO format YYYY-MM-DD)
- description (string)
- amount (positive number)
- type (either "income" or "expense" - determine from context, debits/withdrawals/purchases are expenses, credits/deposits are income)

Return ONLY a valid JSON array of transactions, nothing else. Example format:
[
  {
    "date": "2024-01-15",
    "description": "Grocery Store",
    "amount": 45.67,
    "type": "expense"
  }
]

CSV content:
${fileContent}`;
    }

    // Use Claude to parse the file
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    let transactions;
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        transactions = JSON.parse(jsonMatch[0]);
      } else {
        transactions = JSON.parse(responseText);
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please check file format.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in file' },
        { status: 400 }
      );
    }

    // Create transactions in database
    const created = await prisma.transaction.createMany({
      data: transactions.map((t: any) => ({
        amount: parseFloat(t.amount),
        description: t.description,
        date: new Date(t.date),
        type: t.type,
        userId: session.userId,
      })),
    });

    return NextResponse.json({
      message: `Successfully imported ${created.count} transactions`,
      count: created.count,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
