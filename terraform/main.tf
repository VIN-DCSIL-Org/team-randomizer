# Add API Gateway / other AWS resources here.
# Example placeholder so `terraform plan` has something to show:
#
# resource "aws_apigatewayv2_api" "this" {
#   name          = "team-randomizer-${var.environment}"
#   protocol_type = "HTTP"
# }

# Read-only check that the role can reach API Gateway (lists existing HTTP/WebSocket APIs)
data "aws_apigatewayv2_apis" "check_access" {}

data "aws_ecr_image" "lambda" {
  repository_name = var.lambda_ecr_repository
  image_tag       = var.lambda_image_tag
}

output "apigatewayv2_access_check" {
  description = "IDs of existing API Gateway v2 APIs visible to this role (proves API Gateway read access)"
  value       = data.aws_apigatewayv2_apis.check_access.ids
}

resource "aws_apigatewayv2_api" "this" {
  name          = "team-randomizer-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://mvp.dm3yb2zf1rkq0.amplifyapp.com"]
    allow_methods = ["*"]
    allow_headers = ["*"]
    expose_headers = ["*"]
    max_age        = 0
  }
}

resource "aws_apigatewayv2_stage" "this" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
}

output "http_api_endpoint" {
  description = "Invoke URL for the HTTP API"
  value       = aws_apigatewayv2_api.this.api_endpoint
}




# IAM role is created and managed outside Terraform; only needs iam:PassRole here.
resource "aws_lambda_function" "this" {
  function_name = var.lambda_function_name
  role          = var.lambda_exec_role_arn
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.lambda.image_uri

  dynamic "environment" {
    for_each = length(merge(var.lambda_environment_variables, var.firebase_service_account_json != "" ? { FIREBASE_SERVICE_ACCOUNT_JSON = var.firebase_service_account_json } : {})) > 0 ? [1] : []

    content {
      variables = merge(var.lambda_environment_variables, var.firebase_service_account_json != "" ? { FIREBASE_SERVICE_ACCOUNT_JSON = var.firebase_service_account_json } : {})
    }
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.this.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.this.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-jwt-authorizer"

  jwt_configuration {
    audience = var.cognito_audience
    issuer   = var.cognito_issuer
  }
}

resource "aws_apigatewayv2_route" "lambda_proxy" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "ANY /team_randomizer_lambda/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}


