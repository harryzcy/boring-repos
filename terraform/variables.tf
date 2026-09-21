variable "min_repos" {
  type        = number
  default     = 30
  description = "Floor for discovered repos. Currently 39; below this means the search API returned a partial result."
}
