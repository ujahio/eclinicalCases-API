/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Answers": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "Cases": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "Certificates": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "Feedback": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "JwtSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "MyApi": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "MyBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "MyWeb": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
    "NextNodeEnv": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "NextPassSecretKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "NextPublicBaseUrl": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "PassSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "StudentCaseAttempts": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "Users": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
  }
}
export {}
