export const analyzerPrompts = {
    // System message for the AI
    system: {
        role: 'system',
        content: `Je bent een AI assistent die lesmateriaal analyseert.
Je taak is om:
1. Het lesmateriaal te lezen
2. De hoofdpunten samen te vatten
3. De leerdoelen te identificeren
4. Dit overzichtelijk te presenteren`
    },

    // Main analysis prompt
    analyze: {
        role: 'user',
        content: `Geef een korte samenvatting van deze les met:

1. Onderwerp en doel
2. Leerdoelen
3. activiteiten of werkvormen

Houd het kort en bondig.`
    }
};

// Model configuration
export const modelConfig = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    temperature: 0.7,
    headers: {
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
    }
}; 