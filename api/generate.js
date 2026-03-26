export default async function handler(req, res) {
  const { brandName, market, segment } = req.body

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a market research expert. Write a short audience report for a ${segment} brand called "${brandName}" targeting the ${market} market. Include: a one paragraph summary, 3 key consumer insights, and a recommended marketing message. Keep it concise.`
        }
      ]
    })
  })

  const data = await response.json()
  const text = data.content[0].text

  res.status(200).json({ report: text })
}