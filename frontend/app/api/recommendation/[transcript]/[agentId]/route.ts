/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
    transcript: string;
    agentId: string;
    }>;
};
    
export const POST = async (req: Request, { params }: Props) =>{
    const { transcript, agentId } = await params;
    const elizaUrl = process.env.ELIZA_API_URL;

    if (!elizaUrl) {
        return NextResponse.json(
            { error: 'ELIZA_API_URL environment variable not configured' },
            { status: 500 }
        );
    }

    try {
        // Parse the incoming request body
        const formData = await req.formData();
        const userId = formData.get('userId') || '';
        const userName = formData.get('userName') || '';
        const name = formData.get('name') || '';
        const text = formData.get('text');
        const file = formData.get('file');

        if (!text) {
            return NextResponse.json([]);
        }

        // Create a new FormData object to forward to the ELIZA API
        const forwardFormData = new FormData();
        forwardFormData.append('roomId', userId);
        forwardFormData.append('userId', userId);
        forwardFormData.append('userName', userName);
        forwardFormData.append('name', name);
        forwardFormData.append('text', transcript);
        if (file) {
            if (file instanceof Blob) {
                forwardFormData.append('file', file, 'file');
            }
        }

        // Forward the message to the ELIZA API
        const response = await fetch(`${elizaUrl}/${agentId}/message`, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ELIZA API error: ${error}`);
        }

        // Parse and return the ELIZA API response
        const responseData = await response.json();
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error processing message:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};