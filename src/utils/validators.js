export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = {
  'string.pattern.base':
    'Invalid ObjectID format (24 hexadecimal characters expected)'
}

export const isValidObjectId = (id) => {
  if (!id) return false
  return OBJECT_ID_RULE.test(id)
}
