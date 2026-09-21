data "github_repositories" "managed" {
  query = "user:harryzcy archived:false" # forks excluded by default
}

locals {
  repos = toset(data.github_repositories.managed.names)

  # for_each needs a flat map; key format matches the provider's import ID (repo:name)
  bindings = merge([
    for repo in local.repos : {
      for name, spec in local.labels :
      "${repo}:${name}" => merge(spec, { repo = repo, name = name })
    }
  ]...)
}

# Guard 1: always-present resource whose precondition aborts the whole plan.
# A precondition on github_issue_label itself would NOT work — instances being
# destroyed are not evaluated, which is precisely the case we need to catch.
resource "terraform_data" "repo_discovery_guard" {
  input = length(local.repos)

  lifecycle {
    precondition {
      condition     = length(local.repos) >= var.min_repos
      error_message = "Repo search returned ${length(local.repos)} repos, below the floor of ${var.min_repos}. Refusing to plan."
    }
  }
}

resource "github_issue_label" "managed" {
  for_each = local.bindings

  repository  = each.value.repo
  name        = each.value.name
  color       = each.value.color
  description = each.value.description
}

# The provider POSTs unconditionally, so existing labels must be adopted.
data "github_issue_labels" "existing" {
  for_each   = local.repos
  repository = each.key
}

locals {
  adoptable = merge([
    for repo, labels in data.github_issue_labels.existing : {
      for label in labels.labels :
      "${repo}:${label.name}" => true
      if contains(keys(local.labels), label.name)
    }
  ]...)
}

import {
  for_each = { for key, spec in local.bindings : key => spec if lookup(local.adoptable, key, false) }
  to       = github_issue_label.managed[each.key]
  id       = each.key
}
