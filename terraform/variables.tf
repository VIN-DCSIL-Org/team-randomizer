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
  default     = "team_randomizer_lambda"
}

variable "lambda_image_uri" {
  description = "ECR image URI (with tag/digest) for the Lambda function, passed in from GitHub Actions"
  type        = string
  default     = "660261898478.dkr.ecr.ca-central-1.amazonaws.com/csc491/team-randomizer:eed75a64a872a0cab865e608db591f104661d1dc"
}

variable "lambda_exec_role_arn" {
  description = "ARN of an existing IAM role for the Lambda to assume (avoids granting Terraform IAM create permissions)"
  type        = string
  default     = "arn:aws:iam::660261898478:role/service-role/team_randomizer_lambda-role-syo2pjmd"
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
