# RRCC v1.7 — brand alignment + Vercel Preview

The blue brand × moves up 0.06em only (about 3.6px at the observed 1920 desktop viewport). No redesign, business data change or Library definition change. The v1.6 artifact and evidence are retained.

Offline review: `preview/RRCC-Hantang-4-Center-Preview-v1.7.html`. [Deployment / Owner report](../../../docs/verification/vercel-preview-v1.7.md): Preview NOT PASS; an unexpected Production-target attempt was immediately canceled and not retried. A usable online Preview is not available. Local regression PASS does not imply online acceptance.

## Hosting boundary

Only the two-file `dist` output is published: embedded Dashboard HTML plus `deployment-meta.json`. Build is dependency-free, refuses Production, and rejects unexpected output files. The feature's configuration disables automatic Git deployments; a reviewed exact feature SHA is deployed explicitly through Vercel Git source.

Preview interaction and local verification are not Owner acceptance. No main merge, Production deployment or Production domain change is authorized.
