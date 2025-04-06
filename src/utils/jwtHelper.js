import jwt from 'jsonwebtoken'
export const generateToken = (userId, expiresIn = '30m') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn })
}

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })
}
export const verifyToken = (token, isRefreshToken = false) => {
  return jwt.verify(
    token,
    isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET
  )
}
