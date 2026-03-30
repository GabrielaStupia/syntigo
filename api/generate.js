export default async function handler(req, res) {
  const {
    brandName,
    brandDescription,
    market,
    segment,
    ageRange,
    income,
    styleKeywords,
    reportType,
    reportFocus
  } = req.body

  if (!brandName) {
    return res.status(400).json({ error: 'Brand name is required' })
  }

  const prompts = {
    audience: `You are a senior consumer research strategist specialising in European fashion markets. 

Generate a detailed audience report for the following brand:

Brand: ${brandName}
Description: ${brandDescription || 'Not provided'}
Market: ${market}
Segment: ${segment}
Target age range: ${ageRange}
Income bracket: ${income}
Style sensibility: ${styleKeywords || 'Not specified'}
Focus: ${reportFocus}

Your report must include:

## Audience Overview
A rich two-paragraph summary of who this customer is — their lifestyle, values, and relationship with fashion.

## Persona Profiles
Generate exactly 3 fictional but realistic consumer personas. For each persona include:
- Full name (culturally appropriate for ${market})
- Age and city
- Occupation
- Monthly fashion spend (in EUR)
- Brand loyalty score (0–100)
- Sustainability priority score (0–100)
- Trend sensitivity score (0–100)
- Preferred shopping channels (2–3 options)
- A one-sentence character summary

Format each persona as:
PERSONA: [Name] | [Age] | [City] | [Occupation] | spend:[amount] | loyalty:[score] | sustainability:[score] | trend:[score] | channels:[channel1, channel2] | quote:[one sentence]

## Key Consumer Insights
5 specific, actionable insights about this audience's purchasing behaviour, values, and motivations.

## Brand Recommendations
3 concrete recommendations for how ${brandName} should position itself to resonate with this audience.

## Messaging Direction
A recommended brand message and tone of voice for communicating with this audience.`,

    trend: `You are a senior fashion trend analyst specialising in European consumer markets.

Generate a trend anticipation report for the following brand:

Brand: ${brandName}
Description: ${brandDescription || 'Not provided'}
Market: ${market}
Segment: ${segment}
Target age range: ${ageRange}
Income bracket: ${income}
Style sensibility: ${styleKeywords || 'Not specified'}
Timeframe: ${reportFocus}

Your report must include:

## Trend Overview
A rich two-paragraph summary of the current cultural and consumer mood shaping this audience's expectations.

## Persona Profiles
Generate exactly 3 fictional but realistic consumer personas reflecting this trend landscape. For each persona include:
- Full name (culturally appropriate for ${market})
- Age and city
- Occupation
- Monthly fashion spend (in EUR)
- Brand loyalty score (0–100)
- Sustainability priority score (0–100)
- Trend sensitivity score (0–100)
- Preferred shopping channels (2–3 options)
- A one-sentence character summary

Format each persona as:
PERSONA: [Name] | [Age] | [City] | [Occupation] | spend:[amount] | loyalty:[score] | sustainability:[score] | trend:[score] | channels:[channel1, channel2] | quote:[one sentence]

## Emerging Signals
5 specific trend signals this audience is already responding to or will respond to within the timeframe.

## What They Expect Next
3 concrete expectations this consumer set has of brands like ${brandName} in the coming period.

## Strategic Direction
How ${brandName} should adapt its product, communication, or positioning to stay ahead of these trends.`,

    expansion: `You are a senior international market research strategist specialising in fashion and lifestyle brands.

Generate an international expansion report for the following brand:

Brand: ${brandName}
Description: ${brandDescription || 'Not provided'}
Home market: ${market}
Segment: ${segment}
Target age range: ${ageRange}
Income bracket: ${income}
Style sensibility: ${styleKeywords || 'Not specified'}
Target new market: ${reportFocus}

Your report must include:

## Market Overview
A rich two-paragraph summary of the ${reportFocus} fashion consumer — their cultural values, spending habits, and relationship with international brands.

## Persona Profiles
Generate exactly 3 fictional but realistic consumer personas from ${reportFocus}, culturally transposed from the brand's home market. For each persona include:
- Full name (culturally appropriate for ${reportFocus})
- Age and city
- Occupation
- Monthly fashion spend (in EUR or local equivalent)
- Brand loyalty score (0–100)
- Sustainability priority score (0–100)
- Trend sensitivity score (0–100)
- Preferred shopping channels (2–3 options)
- A one-sentence character summary

Format each persona as:
PERSONA: [Name] | [Age] | [City] | [Occupation] | spend:[amount] | loyalty:[score] | sustainability:[score] | trend:[score] | channels:[channel1, channel2] | quote:[one sentence]

## Cultural Differences
5 key cultural differences between ${market} and ${reportFocus} consumers that ${brandName} must understand before entering the market.

## Market Opportunity
An honest assessment of the opportunity for ${brandName} in ${reportFocus} — where the fit is strong and where the challenges lie.

## Entry Recommendations
3 concrete recommendations for how ${brandName} should adapt its positioning, product, or communication for the ${reportFocus} market.`
  }

  const prompt = prompts[reportType] || prompts.audience

  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const anthropicData = await anthropicResponse.json()
  const reportText = anthropicData.content[0].text

  const reportId = 'rpt_' + Math.random().toString(36).substring(2, 10)

  const reportData = {
    id: reportId,
    brandName,
    brandDescription,
    market,
    segment,
    ageRange,
    income,
    styleKeywords,
    reportType,
    reportFocus,
    report: reportText,
    createdAt: new Date().toISOString()
  }

  await fetch(`${process.env.KV_REST_API_URL}/set/${reportId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reportData)
  })

  const reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://syntigo.vercel.app'}/report.html?id=${reportId}`

  res.status(200).json({ reportUrl, reportId })
}