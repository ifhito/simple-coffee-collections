const http = require('http')

const port = Number(process.env.NOMINATIM_PORT ?? '3999')

const buildMockResults = (query) => {
  if (query.includes('Mock Cafe')) {
    return [
      {
        place_id: 1,
        display_name: 'Mock Cafe, 渋谷区, 東京都, 日本',
        name: 'Mock Cafe',
        lat: '35.6895',
        lon: '139.6917',
        class: 'amenity',
        type: 'cafe',
        address: {
          road: '道玄坂',
          city: '渋谷区',
          state: '東京都',
          country: '日本',
        },
      },
    ]
  }

  return []
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ok')
    return
  }

  if (url.pathname === '/search') {
    const query = url.searchParams.get('q') ?? ''
    const results = buildMockResults(query)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(results))
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(port, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-nominatim] listening on http://127.0.0.1:${port}`)
})

const shutdown = () => {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
