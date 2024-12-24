export const callClaudeAPI = async (promptData) => {
    if (!import.meta.env.VITE_CLAUDE_API_KEY) {
        throw new Error('API key is not configured');
    }

    console.log('Calling Claude API with model:', promptData.model);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: promptData.model,
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: promptData.prompt
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
}; 