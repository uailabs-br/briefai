const AIService = {
    async generateBrief(input, apiKey) {
        const endpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

        const prompt = `
            You are an expert campaign manager for influencers and marketing agencies.
            Take the following unstructured brand input and transform it into a professional, clear, and structured creator brief.
            
            UNSTRUCTURED INPUT:
            """
            ${input}
            """
            
            RETURN A JSON OBJECT with these exact keys:
            - overview: A concise 2-3 sentence summary of the campaign and its goals.
            - talkingPoints: An array of 3-5 key messages the creator MUST say.
            - deliverables: An array of specific requirements (e.g., "1x IG Reel", "3x Stories").
            - dos: Specific actions the creator SHOULD do (positive style guidelines).
            - donts: Specific things to AVOID (red flags/competitors).
            - timeline: Important dates or a general "ASAP" if not specified.
            - payment: A placeholder for payment details (e.g., "$500 base + 10% commission").
            
            ONLY return the JSON object. Do not include markdown code blocks or extra text.
        `;

        try {
            const response = await fetch(`${endpoint}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const textContent = data.candidates[0].content.parts[0].text;

            // Clean up possible markdown code blocks if the AI ignored the instruction
            const jsonStr = textContent.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('AIService Error Details:', error);
            if (error instanceof SyntaxError) {
                throw new Error("AI returned invalid data format. Please try again.");
            }
            if (error.message.includes('Failed to fetch')) {
                throw new Error("Network error or CORS block. If you are opening the file directly (file://), try using a local server (like Live Server or python -m http.server).");
            }
            throw error;
        }
    }
};
