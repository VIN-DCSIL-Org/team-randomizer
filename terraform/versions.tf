terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state. Requires an existing S3 bucket + DynamoDB lock table.
  # Create them once (manually or via a bootstrap stack), then uncomment:
  # backend "s3" {
  #   bucket         = "team-randomizer-tfstate"
  #   key            = "team-randomizer/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "team-randomizer-tf-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}
