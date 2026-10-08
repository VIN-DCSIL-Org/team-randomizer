variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "dev"
}

variable "lambda_function_name" {
  description = "Name to give the Lambda function"
  type        = string
  default     = "team_randomizer_lambda-prd"
}

variable "lambda_ecr_repository" {
  description = "ECR repository name for the Lambda image"
  type        = string
  default     = "csc491/team-randomizer"
}

variable "lambda_image_tag" {
  description = "ECR image tag for the Lambda function"
  type        = string
  default     = "latest"
}

variable "lambda_exec_role_arn" {
  description = "ARN of an existing IAM role for the Lambda to assume (avoids granting Terraform IAM create permissions)"
  type        = string
  default     = "arn:aws:iam::660261898478:role/service-role/team_randomizer_lambda-role-syo2pjmd"
}

variable "lambda_environment_variables" {
  description = "Environment variables to inject into the Lambda function"
  type        = map(string)
  default     = {}
}

variable "firebase_service_account_json" {
  description = "Firebase service account JSON from GitHub Actions secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cognito_issuer" {
  description = "Issuer URI of the Cognito user pool used for JWT authorization"
  type        = string
  default     = "https://cognito-idp.ca-central-1.amazonaws.com/ca-central-1_eTHXTCAiO"
}

variable "cognito_audience" {
  description = "Audience (app client ID) associated with the JWT authorizer"
  type        = list(string)
  default     = ["7p8kh6ta4hklhcc6j23lh9lanj"]
}
