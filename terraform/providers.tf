terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state. Requires an existing S3 bucket.
  backend "s3" {
    bucket  = "vin-dcsil-team-randomizer-tfstate"
    key     = "team-randomizer/terraform.tfstate"
    region  = "ca-central-1"
    encrypt = true
  }
}

provider "aws" {
  region = "ca-central-1"
}
