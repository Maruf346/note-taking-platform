export function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` })
}

export function errorHandler(error, _request, response, _next) {
  if (error.code === 11000) return response.status(409).json({ message: 'An account with that email already exists' })
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((item) => item.message)
    return response.status(400).json({ message: 'Validation failed', details })
  }
  if (error.name === 'CastError') return response.status(400).json({ message: 'Invalid resource id' })
  const status = error.statusCode || 500
  if (status >= 500) console.error(error)
  return response.status(status).json({ message: status >= 500 ? 'Internal server error' : error.message, ...(error.details && { details: error.details }) })
}
