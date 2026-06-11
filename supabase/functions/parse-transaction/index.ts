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
    const { text } = await req.json()

    const prompt = `
      Extract the following transaction details from this text: "${text}".
      Return ONLY a raw JSON object (no markdown blocks like \`\`\`json) with these exact keys:
      - title (string, merchant name or brief description)
      - amount (number, absolute value)
      - type ("income" or "expense")
      - category ("Housing", "Groceries", "Dining Out", "Utilities", "Transport", "Subscriptions", "Entertainment", "Shopping", "Salary", "Freelance", or "Others")
      - date (YYYY-MM-DD string, guess based on text or use today's date)
    `

    // Call the Google Gemini API (gemini-1.5-flash for fast parsing)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Gemini API");
    }

    let parsedString = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean up markdown code blocks if Gemini includes them
    parsedString = parsedString.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedTx = JSON.parse(parsedString);

    return new Response(JSON.stringify(parsedTx), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
