## Role: AWS Solutions Architect

### Goal

Cost estimation to provision an AWS environment for a client.

The app is a serverless app using SST to provision resources. From AWS console here are the resources being used for the app. I am trying to get estimates for a steady increase in users from 200, 500, 750, 1000, 3000 users (think scalability of users). To keep interaction with app, the students have 2 weeks to complete a course before expiration so the majority of spikes in usage is around the times of expiration. The users may also log in to check other functionality of the applications like password resets, change of payment options, downloading of certificates when necessary.

### Consideration

- Please use the attachments for understanding the services being used in the application. Do not consider the costs/dates of usage as these do not reflect actual production costs. Just review the attachment to get a list of services only

- Before continuing with the analysis, ask any clarifying questions about the needs of the app and only after you have asked your questions and received answers, should you make your conclusion /estimates of the cost of the app.

- Lastly, do you need me to provide code snippets about how SST is provisioning AWS services? Will that help in your evaluation?

### General Business & Compliance Requirements

Use Case: Web/Cloud LMS Application
Regions & Availability: Bahrain + Middle East
Compliance Requirements: Not sure. There are payments involved but will be handled with Amazon APS
Projected Growth: Rough estimates. 200, 500, 750, 1000, 3000 users.
Budget Constraints: None as of now.

### Compute Requirements

Type of Workloads: Web servers, databases
Instance Types: Lambda
Operating System: Linux

### Storage Requirements

Type of Storage:
Object Storage: S3 usage.
File Storage: EFS, FSx, or NFS for shared file storage.
Backup & Archival: Dont know

### Database & Data Processing Needs

Database Type: DynamoDB
Read/Write Operations: Expected queries per second (QPS) & latency requirements.
Scaling Strategy: Multi-AZ, Read Replicas
Analytics Services: Redshift, Athena, or OpenSearch for data analysis?

### Networking & Traffic Costs

Data Transfer Costs: Estimate inbound/outbound traffic to/from AWS.
Load Balancers & Route 53: 1 hosted zone, 3 sub-domains.

### Security & IAM

User Access Management: IAM roles, SSO, or external identity providers.
Security Services: AWS WAF, Shield, GuardDuty, Security Hub.
Encryption Needs: KMS for key management, encrypted storage for compliance.

### Monitoring & Logging

Observability Tools: AWS CloudWatch, AWS X-Ray.
Logging Requirements: CloudTrail, centralized logging

### Serverless & Application Services

Lambda Functions: Not sure
API Gateway & Event-Driven Services: API Gateway, EventBridge, Step Functions.

#####

1. User Activity & Lambda Usage:
   Q: How many Lambda invocations do you expect per user, especially during peak times (e.g., near the course expiration period)?
   A: Please instruct
   Q: What is the average execution time and memory allocation per Lambda function?
   A: Please instruct

2. API Gateway & Event-Driven Services:
   Q: Could you provide an estimate of the number of API Gateway calls per user or overall per day?
   A: Please instruct
   Q: Are there any specifics on how you’re using EventBridge or Step Functions (e.g., workflow complexity, frequency)?
   A: Please ignore these services

3. DynamoDB Workload:
   Q: What is the expected read/write throughput (queries per second) for your DynamoDB tables?
   A: Please instruct
   Q: Do you have any estimated table sizes or growth projections for DynamoDB data?
   A: Please instruct

4. Analytics & Data Processing:

Q: Among Redshift, Athena, and OpenSearch, which service(s) are you planning to use for analytics?
A: Please ignore these services

5. If you’re using one of these, do you have an idea of the data volume or query frequency?
   Storage Requirements:

Q: For S3, do you have an estimate of the data stored and frequency of access (e.g., archival vs. active data)?
A: Certificates are about 7-15kb; case materials will require a cap of 5MB of 5 files per upload
Q: For shared file storage (EFS, FSx, or NFS), can you provide an estimate of the required storage capacity and performance needs?
A: Please ignore these services

6. Networking & Data Transfer:

Q: Do you have any estimates for inbound/outbound data transfer volumes (in GB) per month?
A: Please instruct

Q: How many requests per second or overall traffic patterns should we expect for your load balancers and Route 53 usage?
A: Please instruct; we aren't using load balancers directly but some underlying tech may use it.

Security & Monitoring:

Q: Could you elaborate on the expected scale or configuration for AWS WAF
A:
Q: Are there any specific logging retention policies or monitoring configurations with CloudWatch and CloudTrail?
A: API logs should be kept.. please elaborate on how to answer this question

####

1. Lambda Functions

- 20 lambdas total (3 stages)
- 1 users: 100 invocations between signing in and sign out (one interaction)
- Duration: 5 secs max
- Memory: 250GB

200 - $67
500 - $167
750 - 250.05
1000 - $334
3000 - $1000
