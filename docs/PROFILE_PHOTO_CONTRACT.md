# Profile Photo Backend Contract

The Settings profile-photo UI uses the existing same-origin API proxy and MSW architecture. Mock mode implements this contract at `/api/backend/profile/avatar`; live mode forwards it to the configured backend as `/profile/avatar`.

## Endpoints

### `GET /profile/avatar`

Returns the current photo:

```json
{ "ok": true, "data": { "avatarUrl": "https://cdn.example/avatar.webp" } }
```

`avatarUrl` is `null` when no photo is stored.

### `POST /profile/avatar`

Accepts `multipart/form-data` with one field named `photo`. Supported MIME types are `image/jpeg`, `image/png`, and `image/webp`. The frontend maximum defaults to 5 MB and is configurable with `NEXT_PUBLIC_AVATAR_MAX_MB`; the backend must enforce the same or a stricter limit.

The service should validate the authenticated user, inspect the real file signature, normalise orientation, crop or resize to a centred square derivative, store it outside the application database, and return the resulting HTTPS URL using the same envelope as `GET`.

Recommended errors:

- `PHOTO_REQUIRED` with HTTP 422
- `INVALID_PHOTO_TYPE` with HTTP 422
- `PHOTO_TOO_LARGE` with HTTP 413
- `UNAUTHORIZED` with HTTP 401

### `DELETE /profile/avatar`

Removes the stored photo and returns:

```json
{ "ok": true, "data": { "avatarUrl": null } }
```

## Notes

- Mock mode creates a data URL dynamically from the uploaded file so preview, replacement, removal, and session-avatar updates can be tested without hardcoded page data.
- Production should return a cache-versioned or immutable CDN URL.
- Upload progress currently reflects the pending transfer lifecycle. If byte-accurate progress is required, the transport can add an XHR upload-progress adapter without changing this endpoint contract.
