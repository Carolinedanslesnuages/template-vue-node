
export const sendResponsesStatus = (res, status, message) => {
  res.status(status).json({ success: true, message })
}

export const send201 = (res, message) => {
  res.status(201).json({ success: true, message })
}
export const send200 = (res, message) => {
  res.status(200).json({ success: true, message })
}

export const send400 = (res, message) => {
  res.status(400).json({ success: false, message })
}

export const send401 = (res, message) => {
  res.status(401).json({ success: false, message })
}

export const send404 = (res, message) => {
  res.status(404).json({ success: false, message })
}
export const send409 = (res, message) => {
  res.status(409).json({ success: false, message })
}
export const send403 = (res, message) => {
  res.status(403).json({ success: false, message })
}

export const send500 = (res, message) => {
  res.status(500).json({ success: false, message })
}
