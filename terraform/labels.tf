# Ported verbatim from REPO_LABELS in src/github.ts.
locals {
  labels = {
    "bug"            = { color = "d73a4a", description = "Something isn't working" }
    "chore"          = { color = "44b274", description = "Maintenance" }
    "dependencies"   = { color = "ededed", description = "Dependencies" }
    "enhancement"    = { color = "a2eeef", description = "New feature or request" }
    "skip-changelog" = { color = "bfdadc", description = "Do not include in changelog" }
    "wontfix"        = { color = "ffffff", description = "This will not be worked on" }
  }
}
