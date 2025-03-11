import { StatusCodes } from 'http-status-codes'
import { labelService } from '~/services/labelService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const result = await labelService.createNew(req.body, userId)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const labelId = req.params.id
    const updateData = req.body
    const result = await labelService.update(labelId, userId, updateData)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const softDelete = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const labelId = req.params.id
    const result = await labelService.softDelete(labelId, userId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getLabels = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const result = await labelService.getLabels(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getLabel = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const labelId = req.params.id
    const result = await labelService.getLabel(labelId, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const labelController = {
  createNew,
  softDelete,
  update,
  getLabels,
  getLabel
}
