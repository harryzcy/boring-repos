variable "min_repos" {
  type        = number
  default     = 15
  description = "Floor for discovered repos. Well below the real count, so it catches a partial search result without needing an edit every time a repo is archived."
}
