# VSI System Backup — 2026-09-04

This document records the coordinated backup points for the VSI production system.

## 1. Application source
- Repository: `vsizambia/vsiwebsite`
- Production branch: `main`
- Backup branch: `backup/vsi-system-2026-09-04`
- Source commit: `67f339720e393769d02316e8a3798a3d769b33ee`
- Latest change at backup time: Harmonize volunteer profile professional development typography

The backup branch is intentionally pinned to the production source commit above and is not deployed as production.

## 2. Production hosting / deployment
- Vercel project: `vsiwebsite`
- Project ID: `prj_6MC84ECgVTEg56614kGQAoMO6Tsl`
- Latest production deployment: `dpl_7yE74RfPjVw9pudsUfn5BFp6jsvs`
- Deployment state: `READY`
- Deployment commit: `67f339720e393769d02316e8a3798a3d769b33ee`
- Production domains: `www.vsizambia.org`, `vsizambia.org`

## 3. Production database
- Neon project: `Official VSI Website`
- Neon project ID: `square-dawn-21961818`
- Production branch: `production` (`br-round-lake-zaq28272`)
- PostgreSQL: 18
- Region: `aws-eu-west-2`
- Logical size at backup inspection: approximately 33.27 MB

### Live database backup points
- Existing manual full snapshot: `snap-ancient-brook-za7pvmqw`
- Snapshot name: `VSI Official Website full backup 2026-09-03`
- Snapshot created: `2026-09-03T17:04:42Z`
- Snapshot size: `32,792,576` bytes
- Current point-in-time backup branch: `vsi-system-backup-2026-09-04` (`br-muddy-river-zad14402`)
- Backup branch parent LSN: `0/A0E1898`
- Backup branch was created from production on `2026-09-04`.

A new manual Neon snapshot could not be created because the project is currently at its snapshot limit. The persistent backup branch therefore preserves the current database state independently of the older manual snapshot.

## 4. Database objects verified
The production database currently contains these public tables:
- admin_login_attempts
- event_speakers
- news_articles
- volunteer_activity_register
- volunteer_activity_security_rate_limits
- volunteer_application_rate_limits
- volunteer_applications
- volunteer_professional_development
- vsi_event_registrations
- vsi_events
- vsi_master_activity_catalogue
- vsi_master_activity_catalogue_meta

## 5. Storage / uploaded files
Uploaded files and Vercel Blob/storage objects are NOT embedded in this Git repository backup. Their application references and storage configuration remain part of the deployed system. A separate object-storage export should be maintained if an off-platform copy of uploaded media is required.

## 6. Secrets
Passwords, database credentials, API keys, authentication secrets, and other sensitive environment values are intentionally NOT copied into this backup document.

## 7. Recovery order
1. Restore/checkout GitHub backup branch `backup/vsi-system-2026-09-04` or commit `67f339720e393769d02316e8a3798a3d769b33ee`.
2. Restore the Neon database from `vsi-system-backup-2026-09-04` for the newest captured state, or use snapshot `snap-ancient-brook-za7pvmqw` for the 2026-09-03 full snapshot.
3. Reconnect the restored deployment to the required production environment variables/secrets.
4. Deploy the exact source commit to Vercel.
5. Reattach/verify uploaded object storage and run application smoke tests.

## Backup status
- [x] GitHub source backup branch
- [x] Neon current-state backup branch
- [x] Neon manual full snapshot already present (2026-09-03)
- [x] Vercel production deployment identified and verified READY
- [x] Database table inventory recorded
- [x] Recovery instructions recorded
- [ ] Off-platform export of uploaded storage objects
- [ ] Off-platform copy of environment secrets (must be handled securely outside this repository)
