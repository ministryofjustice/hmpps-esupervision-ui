import { RequestHandler } from 'express'
import { services } from '../services'
import MediaUrlType from '../data/models/mediaUrlType'

const { esupervisionService } = services()

const entityToMediaTypeMapping = new Map<string, MediaUrlType>([
  ['checkin|video', MediaUrlType.CheckinVideo],
  ['checkin|snapshot', MediaUrlType.CheckinSnapshot],
  ['offender|photo', MediaUrlType.OffenderReferencePhoto],
])

const resolveUrl: RequestHandler = async (req, res, next) => {
  try {
    const { entityType, attribute, uuid } = req.params
    const snapshotIndex = req.query.snapshotIndex ? parseInt(req.query.snapshotIndex as string, 10) : 0
    const mediaType = entityToMediaTypeMapping.get(`${entityType}|${attribute}`)
    if (mediaType === undefined) {
      res.status(400).send(`Invalid entity='${entityType}' or attribute='${attribute}`)
      return
    }

    const url = await esupervisionService.resolveUrl(mediaType, uuid, { snapshotIndex })
    res.redirect(url)
  } catch (error) {
    next(error)
  }
}

export default resolveUrl
