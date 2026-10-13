# Eva Genie source and RRCC adaptation

Source: Eva Hands v2.52 R5-1 Rev.2, supplied by the Owner through `Eva_Hands_R51_Rev2_Genie_Verification.md` and its source-package endpoint.

Owner authorization, 2026-10-13: 「我有權授權，允許移植並公開發布 genie.js」. This authorizes the RRCC migration and publication in the specified public repository. The source package did not include a general-purpose LICENSE; this notice does not invent an open-source license or grant broader rights than the Owner's authorization.

Reference original SHA-256: `cdb1061c3533289f1eeccef857e97f2367b43c204dd3d3ab73c8b563ac33b9ea` (UTF-8 original bytes, LF). Original is preserved as `eva-genie-r51-rev2.original.js`; an apply_patch-created final newline may be normalized when checking the upstream bytes.

RRCC changes: remove Eva-specific app styling/layout side effects and cp global hooks; namespace as RRCC_GENIE; preserve screenshot layout under the scaled 1920×1080 RRCC stage; fail closed on a rendering exception. The RRCC panel lifecycle is a separate `panel-motion.js` module.

No network dependencies or external animation services. Source has no fetch, XHR, eval or imports. Temporary screenshots remain in browser memory. The source's 48-band WebGL/Canvas mesh, adaptive quality, live source coordinates, fine contour/glow, cancellation and reduced-motion handling are retained. Snapshot failure uses the source's explicitly simplified fallback and is not claimed to be a mesh animation.

`?motion-test=canvas` and `?motion-test=reduced` are local QA switches to exercise fallback and reduced-motion code paths. Forced reduced mode does not establish that an actual OS preference was changed.

The original Eva deployment's tests and its `integrationAuthorized:false` are historical evidence, not RRCC acceptance. RRCC use is separately authorized above. No Production authorization is implied.
