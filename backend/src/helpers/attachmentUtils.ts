import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const bucket = process.env.ATTACHMENT_S3_BUCKET
const urlExpiry = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

// creates attachment signed url
export function createAttachmentPresignedUrl(attachmentId: string): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: attachmentId,
        Expires: parseInt(urlExpiry)
    })
}

// gets the url of the attachment bucket
export function getAttachmentBucketUrl(attachmentId: string): string {
    return `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
}