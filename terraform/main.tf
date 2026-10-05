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

