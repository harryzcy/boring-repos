terraform {
  # 1.12 is the floor verified to accept `use_lockfile` on the S3 backend.
  required_version = ">= 1.12"

  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.11"
    }
  }

  # Partial config: endpoints/credentials supplied via -backend-config in CI,
  # because backend blocks cannot interpolate variables.
  backend "s3" {
    key    = "repos/terraform.tfstate"
    region = "auto"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
    use_lockfile                = true
  }
}

provider "github" {
  owner = "harryzcy" # token supplied via GITHUB_TOKEN
}
