# Add API Gateway / other AWS resources here.
# Example placeholder so `terraform plan` has something to show:
#
# resource "aws_apigatewayv2_api" "this" {
#   name          = "team-randomizer-${var.environment}"
#   protocol_type = "HTTP"
# }

# Read-only check that the role can reach API Gateway (lists existing HTTP/WebSocket APIs)
data "aws_apigatewayv2_apis" "check_access" {}

output "apigatewayv2_access_check" {
  description = "IDs of existing API Gateway v2 APIs visible to this role (proves API Gateway read access)"
  value       = data.aws_apigatewayv2_apis.check_access.ids
}

resource "aws_apigatewayv2_api" "this" {
  name          = "team-randomizer-api"
  protocol_type = "HTTP"
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


