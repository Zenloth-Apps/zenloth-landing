# ZEN-228 publication handoff

The dev preview is a separate private S3/OAC distribution, with noindex response headers and robots exclusions. `deploy-dev.yml` publishes only pushes to dev using its environment-bound OIDC role.

Production promotion is a separate authorized action. The current live publisher serves the old upstream landing; merging this fork's dev branch does not update it. Publish the approved frontend legal/locale routes first, then promote the verified landing artifacts to the actual production publisher. Retain its current origin/configuration and rollback copies. Generate production robots/sitemap; do not publish the dev-only noindex export.

During that promotion, attach the reviewed `cloudfront/public-routes.js` viewer-request function to the existing landing distribution, preserving its security policies and unrelated associations. It redirects the www alias and duplicate index URLs to their canonical equivalents and preserves query values. Verify all four public URLs, robots/sitemap content types, unknown-path 404s, no-JavaScript visibility, and the exact published revision on both hostnames. No production distribution, DNS, bucket policy or publisher was changed by ZEN-228 dev work.

Search Console/Bing submission, genuine search/AI crawler access logs, and field metrics remain provider/runtime checks; source and dev browser checks do not prove indexing or AI citations.

Dev OIDC trust uses GitHub's immutable owner/repository subject IDs (3641259 / 1350130317), verified from failed run 37717332741 in CloudTrail. The deployment role can read invalidation completion only for its own distribution. Recreating or transferring the repository requires reviewing that exact trust subject.

The dev exporter keeps app/official-document links on the frontend dev origin https://d3cpf76wsm49vw.cloudfront.net, with actual EN/ES paths. Production source URLs remain canonical; promote the frontend routes before the landing. The exporter recreates dist to prevent stale sitemaps or documents.

## Authorized staging delivery — October 12, 2026

The separate `staging-hosting.yaml` permits staging only: private versioned/encrypted `zenloth-landing-web-staging`, OAC-only read access and noindex response headers. Its role trusts only the verified current immutable `repo:Zenloth-Apps@339365234/zenloth-landing@1350130317:ref:refs/heads/staging`, audience sts.amazonaws.com. The staging workflow deliberately has no GitHub environment override so its OIDC subject is that exact ref. Dev retains its existing environment-bound role and workflow.

Repository nonsecret variables `LANDING_STAGING_{ORIGIN,DEPLOY_ROLE_ARN,S3_BUCKET,DISTRIBUTION_ID}` come from the reviewed stack outputs. The stage exporter requires the exact CloudFront origin, directs EN/ES app/legal links to the verified frontend stage origin, excludes sitemap, and records all document digests in release.json. The deploy validates before publication, uploads assets before documents, waits invalidation completion and reads back exact revision/digests. Production source/publisher are unchanged and need a separate authorized release.

Rollback uses retained versioned staging objects and reviewed exact distribution/function configuration followed by fresh invalidation. Do not reset or modify dev or production resources. Formal cross-surface QA, provider indexing, physical-device and authenticated journeys remain separate.
