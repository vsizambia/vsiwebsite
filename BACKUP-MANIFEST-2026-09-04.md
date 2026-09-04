# VSI System Backup — 04 September 2026

## Application
- Repository: `vsizambia/vsiwebsite`
- Production branch: `main`
- Production commit: `67f339720e393769d02316e8a3798a3d769b33ee`
- Recovery branch: `backup/vsi-system-2026-09-04`

## Vercel
- Project: `vsiwebsite`
- Project ID: `prj_6MC84ECgVTEg56614kGQAoMO6Tsl`
- Latest production deployment: `dpl_7yE74RfPjVw9pudsUfn5BFp6jsvs`
- Deployment status: `READY`
- Production domains: `www.vsizambia.org`, `vsizambia.org`

## Neon database
- Project: `square-dawn-21961818`
- Production branch: `production` (`br-round-lake-zaq28272`)
- Recovery branch: `vsi-system-backup-2026-09-04` (`br-muddy-river-zad14402`)
- Recovery branch parent timestamp: `2026-09-04T18:36:27Z`
- Existing full manual snapshot: `snap-ancient-brook-za7pvmqw` — `VSI Official Website full backup 2026-09-03`

## Database objects verified
`admin_login_attempts`, `event_speakers`, `news_articles`, `volunteer_activity_register`, `volunteer_activity_security_rate_limits`, `volunteer_application_rate_limits`, `volunteer_applications`, `volunteer_professional_development`, `vsi_event_registrations`, `vsi_events`, `vsi_master_activity_catalogue`, `vsi_master_activity_catalogue_meta`.

## Security
Secrets, passwords, API keys, database credentials and authenticator secrets are intentionally not included in this backup manifest.

## Storage limitation
The connected Neon branchable object-storage service is unavailable in the VSI database region. Therefore uploaded object-storage files (such as volunteer photos) have not been independently copied into this package.

## Backup status
- [x] Git recovery branch created
- [x] Neon current-state recovery branch created and verified READY
- [x] Existing Neon manual snapshot verified
- [x] Vercel production deployment checkpoint verified READY
- [x] Database table inventory recorded
- [x] Recovery manifest stored in the Git backup branch
- [ ] Independent copy of uploaded object-storage files
- [ ] Independent secure escrow of environment secrets
