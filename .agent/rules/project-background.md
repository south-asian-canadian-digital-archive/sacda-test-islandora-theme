---
trigger: always_on
---

# how the project works

working in a docker for islandora (isle-site-template) this is in islandora-dev folder. 

(defined in the .zshrc)
- for running everything, use `iup`
- for main drupal logs, use `ilog`
- for shutting down containers, use 'idn`

there are 16 containers in the docker compose. most of the error swill be in drupal-dev and ide containers

main project is islandora, we're working on making a theme which will basically be the frontend for new sacda.ca

hosting: 
- rhel9
- docker
- drupal 11

deployment: 
- github
- github actions runner (self hosted)
