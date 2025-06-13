# 📝 ***Notes App — A Serverless Full-Stack web app on AWS***

Features: 
- User auth (Cognito)
- CRUD API (Lambda + API Gateway)
- React frontend
- CloudWatch for logging

## 🏗️ Architecture


## 📂 Project Structure
```
project-root/
├── lambda/                  # Lambda functions (CRUD)
│   ├── create/
│   ├── get/
│   ├── update/
│   └── delete/
├── layer/                   # Shared Lambda layer
│   └── nodejs/              # DynamoDB SDK utilities
├── policy/                  # policies
│   ├── Lambda_IAM_Role_Policy.txt
│   └── S3_Bucket_Policy.txt
├── notes-app-frontend/      # React app
│   ├── amplify/             # AWS Amplify config
│   ├── public/              # Static assets
│   ├── src/                 # React components
│   └── package.json
└── .gitignore
```

## 🚀 Deployment Steps

### 1. DynamoDB Setup
### 2. IAM Role & Policies
### 3. Lambda Layer
### 4. Deploy Lambda Functions
Attach to each Lambda:
- **IAM Role**: `NotesAppLambdaRole`
- **Layer**: `NotesLayer`
### 5. API Gateway (HTTP API)
| Method | Path          | Lambda       |
|--------|---------------|--------------|
| GET    | `/notes`      | `getNotes`   |
| POST   | `/notes`      | `createNote` |
| PUT    | `/notes/{id}` | `updateNote` |
| DELETE | `/notes/{id}` | `deleteNote` |

**Enable Cognito Authorizer** for all routes.
### 6. Cognito Setup
1. Create User Pool `NotesAppPool`
2. Add App Client (SPA mode)
3. Update `src/aws-exports.js` in React app.
### 7. Frontend Deployment:
```bash
cd notes-app-frontend
npm install
npm run build
```

## 🔍 Monitoring
- **Lambda Logs**: `/aws/lambda/<function-name>`
- **API Gateway Logs**: `/aws/api-gateway/notes-api`
- **Alarms**: Set up for 5xx errors and high latency.

## 🛠️ Tech Stack Used:
| Component       | Technology           |
|-----------------|----------------------|
| Frontend        | React, AWS Amplify   |
| Authentication  | Amazon Cognito       |
| API             | API Gateway (HTTP)   |
| Compute         | AWS Lambda           |
| Database        | DynamoDB             |
| Monitoring      | CloudWatch           |
