import { RekognitionClient, CompareFacesCommand } from '@aws-sdk/client-rekognition'
import logger from '../../logger'
import AutomatedIdVerificationResult from '../data/models/automatedIdVerificationResult'

export default class FaceCompareService {
  private readonly s3Bucket: string

  constructor(
    private readonly rekognitionClient: RekognitionClient,
    private readonly config: { s3DataBucket: string },
  ) {
    this.s3Bucket = this.config.s3DataBucket
  }

  async processSubmission(submissionId: string): Promise<AutomatedIdVerificationResult> {
    const Commmand = new CompareFacesCommand({
      SourceImage: {
        S3Object: {
          Bucket: this.s3Bucket,
          Name: `checkin-${submissionId}/0`,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: this.s3Bucket,
          Name: `checkin-${submissionId}/1`,
        },
      },
    })

    const result = await this.rekognitionClient.send(Commmand)
    logger.info('Compared the face', result)

    let bestMatch: { Similarity: number } = { Similarity: 0.0 }
    if (result.FaceMatches.length > 0) {
      for (let i = 0; i < result.FaceMatches.length; i += 1) {
        if (result.FaceMatches[i].Similarity > bestMatch.Similarity) {
          bestMatch = result.FaceMatches[i] as { Similarity: number }
        }
      }

      return bestMatch.Similarity > 90 ? AutomatedIdVerificationResult.Match : AutomatedIdVerificationResult.NoMatch
    }
    logger.info('no face matches', submissionId)

    return AutomatedIdVerificationResult.NoMatch
  }
}
