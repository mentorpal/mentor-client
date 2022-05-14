terraform {
  backend "s3" {
    bucket         = "mentor-client-tf-state-us-east-1"
    region         = "us-east-1"
    key            = "terraform.tfstate"
    dynamodb_table = "mentor-client-tf-lock"
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}
