import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, transactions } = await req.json()

    const systemInstruction = `
      You are a helpful AI financial assistant. 
      Here is the user's transaction history in JSON format:
      ${JSON.stringify(transactions)}
      Analyze this history to answer the user's question accurately. Be concise, direct, and highlight key financial insights.
    `

    // Call the Google Gemini API (gemini-1.5-pro or gemini-1.5-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemInstruction + "\n\nUser Question: " + prompt }]
            }
          ]
        }),
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Gemini API");
    }

    // Extract Gemini's text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ text: textResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
