export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'No report ID provided' })
  }

  try {
    const response = await fetch(`${process.env.KV_REST_API_URL}/get/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
      }
    })

    const data = await response.json()

    if (!data.result) {
      return res.status(404).json({ error: 'Report not found' })
    }

    const report = typeof data.result === 'string'
      ? JSON.parse(data.result)
      : data.result

    res.status(200).json(report)

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' })
  }
}