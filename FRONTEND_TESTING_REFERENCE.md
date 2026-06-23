# Frontend Testing Reference

Derived from the Cypress backend API test suite. Use this document to understand every form field, validation rule, error message, and expected API behavior when building or testing the frontend UI.

---

## Table of Contents

1. [Auth & Conventions](#1-auth--conventions)
2. [Response Structure](#2-response-structure)
3. [Sites](#3-sites)
4. [Instances (CRUD)](#4-instances-crud)
5. [Instance Settings](#5-instance-settings)
6. [Instance Homepage Layout](#6-instance-homepage-layout)
7. [Instance Homepage Resources](#7-instance-homepage-resources)
8. [Instance Homepage Videos](#8-instance-homepage-videos)
9. [Instance Pages](#9-instance-pages)
10. [Instance Page Resources](#10-instance-page-resources)
11. [Instance Buttons](#11-instance-buttons)
12. [Feedback](#12-feedback)
13. [Shared Field Rules](#13-shared-field-rules)
14. [Security Payloads & Expected Behavior](#14-security-payloads--expected-behavior)
15. [Common Error Codes](#15-common-error-codes)

---

## 1. Auth & Conventions

### Authentication
All admin/reseller endpoints require a **Bearer token** in the `Authorization` header.

```
POST /auth/authenticate?domain=www
Body: { username, password }
Response: 200 → body.body.access_token
```

Token validity is checked via `GET /auth/me`. Re-authenticate if `401` or `403` is returned.

### Public endpoints (e.g., feedback)
Obtain a client token once:
```
POST /open/sites/authenticate
Body: { auth_type: 0, client_id, client_secret, domain }
Response: 200 → body.body.access_token
```
Pass this token to public endpoints via `Authorization: Bearer <token>`.

### Response time SLA
Every API response should complete within **3000 ms**.

---

## 2. Response Structure

### Success response
```json
{
  "body": { /* resource object */ }
}
```

### Validation error (HTTP 417)
```json
{
  "body": {
    "<field_name>": ["Error message string."]
  }
}
```
Access via: `response.body.body.<field>[0]`

### Business rule error (HTTP 422)
```json
{
  "status": {
    "message": "Error message string."
  }
}
```
Access via: `response.body.status.message`

### Not found (HTTP 404)
```json
{
  "status": {
    "message": "The item/page you were looking for cannot be found."
  }
}
```

---

## 3. Sites

### Endpoint
```
POST   /sites                → Create site
GET    /sites/:id            → Get site
PUT    /sites/:id            → Update site
DELETE /sites/:id            → Delete site
```

### Request body
```json
{
  "title":           "string",
  "domain":          "string",
  "logo_url":        "string (URL)",
  "primary_color":   "string (hex)",
  "secondary_color": "string (hex)",
  "layout":          "string (theme element name, optional)",
  "display_logo":    true | false
}
```

### On success (200)
Response includes:
- `id`, `title`, `domain`, `logo_url`, `primary_color`, `secondary_color`, `layout`, `display_logo`
- **`default_instance_id`** — a default instance is automatically created when a site is created

---

### Field rules — Sites

#### `title`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.title[0]` = `"The title field is required."` |
| Max 255 chars | 417 → `body.title[0]` = `"The title may not be greater than 255 characters."` |
| Min 1 char | 200 ✓ |
| Type must be string | 417 on integer |
| Security payloads (XSS, SQL) | 200 — stored safely (input sanitized) |

#### `domain`
| Rule | Behavior |
|------|----------|
| Required | 417 |
| Max 50 chars | 417 → `body.domain[0]` = `"The domain may not be greater than 50 characters."` |
| Must be lowercase | 417 → `body.domain[0]` = `"The domain must be a lowercase."` |
| Must contain alphabet | 417 → `body.domain[0]` = `"Domain must contain alphabet"` |
| Allowed chars: lowercase letters, digits, hyphens | — |
| No leading hyphen | 417 |
| No trailing hyphen | 417 |
| No consecutive hyphens (`--`) | 417 |
| No spaces, underscore, dot, special chars | 417 |
| Type must be string | 417 |
| Must be unique | 417 → `body.domain[0]` = `"The domain has already been taken."` |
| Deleted site domain can be reused | 200 ✓ |
| Security payloads | 417 — all rejected (invalid domain format) |

#### `logo_url`
| Rule | Behavior |
|------|----------|
| Required | 417 |
| Accepted extensions: `.jpg`, `.jpeg`, `.png`, `.svg` | 200 ✓ |
| Rejected extensions: `.gif`, `.pdf`, `.mp4` | 417 → `body.logo_url[0]` = `"The logo url must end with one of the following: jpg, png, jpeg, svg."` |
| No extension / invalid URL format | 417 |
| Type must be string | 417 |
| Security payloads | 417 — all rejected |

#### `primary_color`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.primary_color[0]` = `"The primary color field is required."` |
| Format: `#RGB` or `#RRGGBB` (hex, case-insensitive) | 200 ✓ |
| Missing `#` prefix | 417 → `body.primary_color[0]` = `"The primary color field must be a valid hexadecimal color."` |
| Invalid hex chars (e.g., `#gggggg`) | 417 — same message |
| Too long (e.g., `#fffffff`) | 417 — same message |
| Integer type | 417 — same message |
| RGB string (`rgb(...)`) | 417 — same message |
| Security payloads | 417 — same message |

#### `secondary_color`
Same rules as `primary_color`. Error messages use `"secondary color"` in the text.
- Required: `"The secondary color field is required."`
- Invalid: `"The secondary color field must be a valid hexadecimal color."`

#### `layout`
| Rule | Behavior |
|------|----------|
| Optional — omit, null, or empty string → default applied | 200 ✓ |
| Valid values: `lyb-global-tile`, `lyb-global-tile-plus` | 200 ✓ |
| Invalid string (unknown theme name) | 422 → `status.message` = `"The selected theme is invalid."` |
| Integer or boolean type | 417 → `body.layout[0]` = `"The layout must be a string."` |
| Security payloads | 422 — same message as invalid |

#### `display_logo`
| Rule | Behavior |
|------|----------|
| Optional | — |
| `true` or `false` (boolean) | 200 ✓ |
| Non-boolean string | 417 → `body.display_logo[0]` = `"The display logo field must be true or false."` |
| Security payloads | 417 |

---

### Edge cases — Sites
- Empty JSON payload `{}` → 417
- Extra/unknown fields in payload → ignored, 200 ✓
- All fields null → 417
- Whitespace-only values → 417
- `PUT /sites` (wrong method on collection endpoint) → 405
- `DELETE /sites` (wrong method on collection endpoint) → 405

---

## 4. Instances (CRUD)

### Endpoint
```
POST   /sites/:site_id/instances                       → Create instance
GET    /sites/:site_id/instances/:id                   → Get instance
PUT    /sites/:site_id/instances/:id                   → Update instance
DELETE /sites/:site_id/instances/:id                   → Delete instance
POST   /sites/:site_id/instances/:id/copy              → Copy instance
GET    /sites/:site_id/instances/:id/toggle-status     → Toggle active/inactive
```

### Request body
```json
{
  "title":           "string",
  "message":         "string (optional, freeform)",
  "primary_color":   "string (hex)",
  "secondary_color": "string (hex)",
  "display_logo":    true | false,
  "layout":          "string (theme element name)",
  "slug":            "string"
}
```

### On success (200)
Response includes: `id`, `title`, `message`, `primary_color`, `secondary_color`, `display_logo`, `layout`, `slug`

---

### Field rules — Instances

#### `title`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.title[0]` = `"The title field is required."` |
| Max 255 chars | 417 → `body.title[0]` = `"The title may not be greater than 255 characters."` |
| Min 1 char | 200 ✓ |
| 10,000+ chars | 417 — same max message |
| 1 MB string | 417 — same max message |
| Security payloads | 200 — sanitized and stored |

#### `message`
| Rule | Behavior |
|------|----------|
| Optional — empty string stored as `null` | 200, `body.message` = `null` |
| Large text (10,000 / 100,000 / 1 MB chars) | 200 — no max limit enforced |
| Security payloads | Never 500 — stored safely |

#### `layout`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.layout[0]` = `"The layout field is required."` |
| Valid values: `lyb-global-tile`, `lyb-global-tile-plus` | 200 ✓ |
| Empty string | 417 — required message |
| Invalid string | 422 → `status.message` = `"The selected theme is invalid."` |
| Integer type | 417 → `body.layout[0]` = `"The layout must be a string."` |
| Security payloads | 422 — invalid theme message |

#### `primary_color` / `secondary_color`
Same rules as Sites (see §3). Both required.

#### `display_logo`
| Rule | Behavior |
|------|----------|
| `true` or `false` | 200 ✓ |
| Non-boolean string | 417 → `body.display_logo[0]` = `"The display logo field must be true or false."` |

#### `slug`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.slug[0]` = `"The slug field is required."` |
| Max 50 chars | 200 at 50; 417 at 51 → `"The slug may not be greater than 50 characters."` |
| Min 1 char | 200 ✓ |
| Format: lowercase letters + digits + hyphens; must start with a letter | — |
| Must contain at least one letter (not all digits) | 417 → `body.slug[0]` = `"The slug format is invalid."` |
| Leading hyphen | 417 — invalid format |
| Trailing hyphen | 417 — invalid format |
| Consecutive hyphens (`--`) | 417 — invalid format |
| Uppercase letters | 417 — invalid format |
| Spaces, underscore, dot, special chars | 417 — invalid format |
| `%20` (URL-encoded space) | 417 — invalid format |
| Unicode chars | 417 — invalid format |
| HTML tags (`<b>slug</b>`) | 417 — invalid format |
| Single hyphen `-` | 417 — invalid format |
| Integer type | 417 → `body.slug[0]` = `"The slug must be a string."` |
| Boolean type | 417 — type message |
| Null | 417 — required message |
| Duplicate within same site | 417 → `body.slug[0]` = `"The slug has already been taken."` |
| Same slug in different site | 200 ✓ — slug uniqueness is **per site** |
| Deleted instance slug can be reused | 200 ✓ |
| Security payloads | 417 — invalid format |

### Site ID path parameter
| Value | Behavior |
|-------|----------|
| Non-existent | 404 → `status.message` = `"The item/page you were looking for cannot be found."` |
| Deleted site | 404 — same message |
| Another reseller's site | 404 — same message |
| Non-numeric string | 404 — same message |

---

## 5. Instance Settings

### Endpoint
```
GET /sites/:site_id/instances/:instance_id/settings
PUT /sites/:site_id/instances/:instance_id/settings/:setting_id
```

### Request body (PUT)
```json
{
  "key":   "string (setting key name)",
  "value": true | false | 0 | 1
}
```

### Known setting keys
- `"homepage_resource"` — controls homepage resource feature
- `"buttons"` — controls instance button feature
- Other `enable_*` settings — must be enabled before the related endpoints return 200 (otherwise 403)

### Field rules — Instance Settings

#### `key`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.key[0]` = `"The key field is required."` |
| Must be a known key | 417 → `body.key[0]` = `"The selected key is invalid."` |

#### `value`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.value[0]` = `"The value field is required."` |
| Accepted: `true`, `false`, `1`, `0` (boolean-like) | 200 ✓ |
| Rejected: negative integer (`-1`) | 417 → `body.value[0]` = `"The value field must be true or false."` |
| Rejected: integer > 1 (`2`) | 417 — same message |
| Rejected: string (`"yes"`) | 417 — same message |
| Rejected: decimal (`0.5`) | 417 — same message |
| Rejected: null | 417 |
| Security payloads | 417 |

#### `setting_id` path parameter
| Value | Behavior |
|-------|----------|
| Non-existent | 404 → `status.message` = not found message |
| `0` | 404 |
| Negative | 404 |
| Non-numeric string | 404 |

---

## 6. Instance Homepage Layout

### Endpoint
```
POST /sites/:site_id/instances/:instance_id/homepage/layout
```

> **Prerequisite:** The relevant feature setting must be enabled (set to `true`) before use.

### Request body
```json
{
  "banner":     "string (URL ending in .jpg/.png/.jpeg/.svg)",
  "title":      "string",
  "footer":     "string",
  "sub_footer": true | false
}
```

### Field rules

#### `banner`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.banner[0]` = `"The banner field is required."` |
| Valid: URL ending in `.jpg`, `.png`, `.jpeg`, `.svg` | 200 ✓ |
| Invalid extension | 417 → `body.banner[0]` = `"The banner must end with one of the following: .jpg, .png, .jpeg, .svg."` |

#### `footer`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.footer[0]` = `"The footer field is required."` |
| Type must be string | 417 → `body.footer[0]` = `"The footer must be a string."` |

#### `sub_footer`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.sub_footer[0]` = `"The sub footer field is required."` |
| Must be boolean | 417 → `body.sub_footer[0]` = `"The sub footer field must be true or false."` |

#### Feature disabled
If the homepage layout setting is off: 403 → `"This feature is disabled for the current instance."`

---

## 7. Instance Homepage Resources

### Endpoint
```
POST   /sites/:site_id/instances/:instance_id/homepage/resources
GET    /sites/:site_id/instances/:instance_id/homepage/resources
PUT    /sites/:site_id/instances/:instance_id/homepage/resources/:id  (order)
DELETE /sites/:site_id/instances/:instance_id/homepage/resources/:id
```

### Request body (POST)
```json
{
  "order":         1,
  "resource_id":   123,
  "version_id":    null,
  "resource_type": "string"
}
```

### Field rules

#### `resource_id`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.resource_id[0]` = `"The resource id field is required."` |
| Must be integer | 417 → `body.resource_id[0]` = `"The resource id must be an integer."` |
| Min 1 | 417 → `body.resource_id[0]` = `"The resource id must be at least 1."` |
| Duplicate attachment | 417 → `body.resource_id[0]` = `"The resource has already been attached to this instance."` |

#### `version_id`
| Rule | Behavior |
|------|----------|
| Only applicable for `resource_type = "video"` | If sent for non-video: 417 → `"The version id field is only applicable to the video resource type."` |
| Must be integer | 417 → `body.version_id[0]` = `"The version id must be an integer."` |
| Min 1 | 417 → `body.version_id[0]` = `"The version id must be at least 1."` |

#### `resource_type`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.resource_type[0]` = `"The resource type field is required."` |
| Must be valid enum value | 417 → `body.resource_type[0]` = `"The selected resource type is invalid."` |

#### `order`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.order[0]` = `"The order field is required."` |
| Min 1 | 417 → `body.order[0]` = `"The order must be at least 1."` |
| Must be integer | 417 → `body.order[0]` = `"The order must be an integer."` |
| Max 999999999 | 417 → `body.order[0]` = `"The order may not be greater than 999999999."` |

---

## 8. Instance Homepage Videos

### Endpoint
```
POST   /sites/:site_id/instances/:instance_id/homepage/videos
GET    /sites/:site_id/instances/:instance_id/homepage/videos
PUT    /sites/:site_id/instances/:instance_id/homepage/videos/:id  (order)
DELETE /sites/:site_id/instances/:instance_id/homepage/videos/:id
```

### Request body (POST)
```json
{
  "order":      0,
  "version_id": 123
}
```

### Field rules

#### `order`
| Rule | Behavior |
|------|----------|
| Min 0 (zero allowed) | 417 if below 0 → `"The order must be at least 0."` |

#### `version_id`
| Rule | Behavior |
|------|----------|
| Must be present | 417 → `"The version id field must be present."` |
| Max 10 digits | 417 → `"The version id must be between 1 and 10 digits."` |
| Must reference a valid video in the bucket | 417 → `"The selected version id is invalid."` |
| Duplicate video | 417 → `"The video has already been added to this homepage."` |
| Video not in bucket | Error → `"Video Does Not Exist in Bucket"` |

### Video order
When reordering, send the complete ordered list. Mismatch → `"The given data is invalid."` / `"err_selected_video_not_exists"`

---

## 9. Instance Pages

### Endpoint
```
POST   /sites/:site_id/instances/:instance_id/pages
GET    /sites/:site_id/instances/:instance_id/pages/:page_id
PUT    /sites/:site_id/instances/:instance_id/pages/:page_id
DELETE /sites/:site_id/instances/:instance_id/pages/:page_id
```

### Request body
```json
{
  "title":         "string",
  "description":   "string (optional, HTML allowed)",
  "status":        1 | 2,
  "icon":          "string (CSS class, optional)",
  "order":         1,
  "header":        "string (optional, HTML allowed)",
  "footer":        "string (optional, HTML allowed)",
  "lang":          "en" | "es" (optional),
  "thumbnail_url": "string (URL, optional)",
  "related_id":    integer (optional, id of parent page)
}
```

### Status values
| Value | Meaning |
|-------|---------|
| `1` | Unpublished |
| `2` | Published |

### On success (200)
Response includes: `id`, `title`, `description`, `status`, `icon`, `order`, `header`, `footer`, `lang`

---

### Field rules — Instance Pages

#### `title`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.title[0]` = `"The title field is required."` |
| Max 255 chars | 417 → `body.title[0]` = `"The title may not be greater than 255 characters."` |
| Min 1 char | 200 ✓ |
| Integer type | 417 → `body.title[0]` = `"The title must be a string."` |
| Special characters allowed | 200 ✓ |
| Security payloads | 200 — sanitized |

#### `status`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.status[0]` = `"The status field is required."` |
| Valid: `1` or `2` | 200 ✓ |
| `0` (invalid) | 417 → `body.status[0]` = `"The selected status is invalid."` |
| Null | 417 — required message |
| Empty string | 417 — required message |
| Boolean `true` accepted as `1` | 200 ✓ |

#### `description`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| HTML content allowed | 200 ✓ |
| Up to 5000 chars | 200 ✓ |
| 100,001+ chars | 417 |
| Integer type | 417 |
| Security payloads | 200 — sanitized |

#### `icon`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| Valid CSS class string (e.g., `fas fa-home`) | 200 ✓ |
| Integer type | 417 |
| 10,001+ chars | 417 |
| Integer max value `2147483647` | 417 |

#### `thumbnail_url`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| Must be a valid URL | 417 → `body.thumbnail_url[0]` = `"The thumbnail url format is invalid."` |
| Both `icon` and `thumbnail_url` sent | 200 — accepted (note: `icon` field is prohibited when `thumbnail_url` is present per message, but tests show 200) |
| 10,001+ char URL | 417 |
| Integer type | 417 |

#### `order`
| Rule | Behavior |
|------|----------|
| Min 0 | 417 if below 0 → `body.order[0]` = `"The order must be at least 0."` |
| Must be integer | 417 → `body.order[0]` = `"The order must be an integer."` |
| Decimal (1.5) | 417 — integer message |
| String type | 417 — integer message |

#### `lang`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| Valid values: `"en"`, `"es"` (lowercase) | 200 ✓ |
| `"EN"` (uppercase) | 417 → `body.lang[0]` = `"The selected lang is invalid."` |
| `"fr"` or other codes | 417 — same message |
| Empty string | 200 ✓ (treated as absent) |
| Integer type | 417 |
| 10,001+ chars | 417 |

#### `header` / `footer`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| HTML content allowed | 200 ✓ |
| Very large strings (100,001+ chars) | 200 ✓ (no hard limit observed) |
| Integer type `2147483647` | 417 |
| Security payloads | 200 — sanitized |

#### `related_id` (parent page)
| Rule | Behavior |
|------|----------|
| Optional, null = no parent | 200 ✓ |
| Valid existing page id from same instance | 200 ✓ |
| Non-existent page id | 404 |
| Page id from deleted instance | 404 |
| Negative integer | 417 → `body.related_id[0]` = `"The related id must be at least 0."` |
| String type | 417 → `body.related_id[0]` = `"The related id must be a number."` |
| `0` (zero) | 404 |
| Very large integer (9999999999999999) | 404 |
| Security payloads | 417 |

### URL Path Verifications — Pages
| Path | Behavior |
|------|----------|
| Non-existent `site_id` | 404 |
| Deleted `site_id` | 404 |
| Another reseller's `site_id` | 404 |
| Non-numeric `site_id` | 404 |
| Negative `site_id` | 404 |
| Path traversal (`../`, `%2e%2e%2f`) | 404 |
| Double URL-encoded traversal (`%252e%252e%252f`) | 404 |
| Null byte injection (`%00`) | 400 |
| Non-existent `instance_id` | 404 |
| Non-numeric `instance_id` | 404 |
| Negative `instance_id` | 404 |

### Authorization — Pages
| Scenario | Behavior |
|----------|----------|
| No `Authorization` header | 401 |
| Invalid token | 401 |
| Malformed header (e.g., `NotBearer token`) | 401 |

### Edge cases — Pages
- Empty payload `{}` → 417
- All fields null → 417
- Extra/unknown fields → ignored, 200 ✓
- `PUT` to collection endpoint → 405
- `DELETE` to collection endpoint → 405

---

## 10. Instance Page Resources

Sub-resources attached to instance pages. Each resource type has Add, Delete/Get, and Order test files.

### Resource types & endpoints
| Resource Type | Endpoint base |
|---------------|---------------|
| Calculator | `/sites/:sid/instances/:iid/pages/:pid/calculators` |
| Contact | `/sites/:sid/instances/:iid/pages/:pid/contacts` |
| Document | `/sites/:sid/instances/:iid/pages/:pid/documents` |
| Image | `/sites/:sid/instances/:iid/pages/:pid/images` |
| Link | `/sites/:sid/instances/:iid/pages/:pid/links` |
| Video | `/sites/:sid/instances/:iid/pages/:pid/videos` |

### Common page resource rules

#### `order`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.order[0]` = `"The order field is required."` |
| Min 0 | 417 if negative → `"The order must be at least 0."` |
| Must be integer | 417 → `"The order must be an integer."` |
| Max 999999999 | 417 → `"The order may not be greater than 999999999."` |

#### Resource ordering (PUT bulk update)
Send the complete ordered list. Mismatch → 417 → `"The request doesn't include correct set of resources."`

#### Access control
All page resource endpoints return **404** for:
- Non-existent `site_id`, `instance_id`, or `page_id`
- Deleted resources
- Resources from another reseller's site

### Calculator-specific request body
```json
{
  "calculator_id":   123,
  "calculator_type": "string",
  "order":           1
}
```
Calculator order mismatch → `"The request doesn't include the correct set of calculators."`

### Restricted resource access
The following IDs are pre-configured as inaccessible for cross-reseller and status tests:

| Resource | ID type | ID |
|----------|---------|----|
| Videos | deleted | 23 |
| Videos | unpublished | 19 |
| Contacts | deleted | 23 |
| Contacts | unpublished | 1 |
| Links | deleted | 5 |
| Links | unpublished | 2 |
| Images | deleted | 6 |
| Images | unpublished | 24 |
| Documents | deleted | 6 |
| Documents | unpublished | 3 |

---

## 11. Instance Buttons

### Prerequisite
The `"buttons"` instance setting must be enabled (`true`) before the endpoint accepts requests. Otherwise: 403.

### Endpoint
```
POST   /sites/:site_id/instances/:instance_id/button-resources
GET    /sites/:site_id/instances/:instance_id/button-resources/:id
PUT    /sites/:site_id/instances/:instance_id/button-resources/:id
DELETE /sites/:site_id/instances/:instance_id/button-resources/:id
```

### Request body
```json
{
  "title":            "string",
  "placement":        "navbar" | "header",
  "icon":             "string (CSS class, optional)",
  "button_style":     0 | 1 | 2,
  "class_name":       "string (optional, max 50 chars)",
  "text_color":       "string (hex, optional)",
  "background_color": "string (hex, optional)",
  "order":            0,
  "status":           1 | 2,
  "type":             "link" | "modal" | "scroll",
  "content":          "string",
  "property":         "string (JSON, optional)"
}
```

### On success (200)
Response includes: `title`, `placement`, `order`, `type`, `content` (and other fields)

---

### Field rules — Instance Buttons

#### `title`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.title[0]` = `"The title field is required."` |
| Max 100 chars | 200 at 100; 417 at 101 |
| Min 1 char | 200 ✓ |
| Integer type | 417 |
| Security payloads | 200 — sanitized |

#### `placement`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.placement[0]` = `"The placement field is required."` |
| Valid values: `"navbar"`, `"header"` (lowercase only) | 200 ✓ |
| `"NAVBAR"` or `"Navbar"` (case mismatch) | 417 → `body.placement[0]` = `"The selected placement is invalid."` |
| `"footer"` or any other string | 417 — same message |
| Empty string | 417 — required message |
| Null | 417 — required message |
| Integer | 417 |
| Security payloads | 417 |

#### `type`
| Rule | Behavior |
|------|----------|
| Required | 417 → `body.type[0]` = `"The type field is required."` |
| Valid values: `"link"`, `"modal"`, `"scroll"` (lowercase) | 200 ✓ |
| `"LINK"` (uppercase) | 417 → `body.type[0]` = `"The selected type is invalid."` |
| Any other string | 417 — same message |
| Null, empty string | 417 — required message |
| Integer | 417 |
| Security payloads | 417 |

#### `content` — depends on `type`
| Type | Valid content | Invalid → 417 |
|------|--------------|----------------|
| `"link"` | Valid URL (e.g., `https://example.com`) | Non-URL, plain text |
| `"modal"` | Any text or HTML | Empty string |
| `"scroll"` | CSS selector starting with `#` (e.g., `#section-hero`) | Without `#`, URL, empty string |

Content is required for all types: empty string → 417 → `body.content[0]` = `"The content field is required."`

#### `button_style`
| Rule | Behavior |
|------|----------|
| Valid values: `0` (custom), `1` (primary), `2` (secondary) | 200 ✓ |
| `3` or higher | 417 |
| `-1` or negative | 417 |
| String type | 417 |
| Null | 417 |
| Decimal (1.5) | 417 |
| Security payloads | 417 |

#### `order`
| Rule | Behavior |
|------|----------|
| Min 0 (zero allowed) | 200 ✓ |
| Required | 417 → `body.order[0]` = `"The order field is required."` |
| Negative | 417 → `body.order[0]` = `"The order must be at least 0."` |
| String type | 417 → `body.order[0]` = `"The order must be an integer."` |
| Decimal | 417 — integer message |

#### `status`
| Rule | Behavior |
|------|----------|
| Valid: `1` (unpublished), `2` (published) | 200 ✓ |
| `0` | 417 → `body.status[0]` = `"The selected status is invalid."` |
| Null | 417 → `body.status[0]` = `"The status field is required."` |
| Empty string | 417 — required message |
| String `"true"` | 417 — invalid message |

#### `icon`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| Null | 200 ✓ |
| Valid CSS class (e.g., `fas fa-hands`, `fab fa-firefox`) | 200 ✓ |
| Max 100 chars | 417 at 101 |
| Integer type | 417 |
| Security payloads | 200 — sanitized |

#### `class_name`
| Rule | Behavior |
|------|----------|
| Optional, null allowed | 200 ✓ |
| Max 50 chars | 200 at 50; 417 at 51 |
| Integer type | 417 |
| Security payloads | 200 — sanitized |

#### `text_color` / `background_color`
| Rule | Behavior |
|------|----------|
| Optional | 200 ✓ |
| Valid: `#RGB` or `#RRGGBB` (hex) | 200 ✓ |
| No `#` prefix | 417 |
| Invalid hex chars | 417 |
| Integer type | 417 |
| RGB format `rgb(...)` | 417 |
| Security payloads | 417 |

#### `property`
| Rule | Behavior |
|------|----------|
| Optional, null allowed | 200 ✓ |
| Valid JSON string (`"{}"`, `"[]"`, `'{"key":"value"}'`) | 200 ✓ |
| Nested JSON | 200 ✓ |
| JSON with special chars in values | 200 ✓ |
| XSS/SQL inside a valid JSON value | 200 — sanitized |
| Plain string (not JSON) | 417 |
| Integer type | 417 |
| Malformed JSON | 417 |
| Boolean type | 417 |
| JSON with unescaped quotes | 417 |

---

## 12. Feedback

### Endpoint
```
POST /open/events/feedbacks
```
(Public endpoint — uses client site token, not admin token)

### Request body
```json
{
  "client_id":   "string (ULID format)",
  "session_id":  "string (ULID format)",
  "event_name":  "string (enum)",
  "reseller_id": integer,
  "site_domain": "string",
  "site_type":   integer,
  "rating":      integer (1–5),
  "feedback": {
    "pages": [
      { "id": integer, "title": "string", "is_liked": true | false }
    ]
  }
}
```

### Field rules — Feedback

| Field | Required | Valid values | Error message |
|-------|----------|-------------|---------------|
| `client_id` | Yes | ULID string | Required: `"The client id field is required."` / Invalid: `"The client id field must be a valid ULID."` |
| `session_id` | Yes | ULID string | Required: `"The session id field is required."` / Invalid: `"The session id field must be a valid ULID."` |
| `event_name` | Yes | `"feedback_submitted"` | Required: `"The event name field is required."` / Invalid: `"The selected event name is invalid."` |
| `reseller_id` | Yes | Integer (valid reseller) | Required: `"The reseller id field is required."` / Invalid: `"The selected reseller id is invalid."` |
| `site_domain` | Yes | String | Required: `"The site domain field is required."` / Type error: `"The site domain must be a string."` |
| `site_type` | Yes | Integer enum | Required: `"The site type field is required."` / Invalid: `"The selected site type is invalid."` |
| `rating` | Yes | Integer 1–5 | Required: `"The rating field is required."` / Below 1: `"The rating must be at least 1."` / Above 5: `"The rating may not be greater than 5."` / Type: `"The rating must be an integer."` |
| `feedback` | Yes | Object with `pages` array | Required: `"The feedback field is required."` |
| `pages[].title` | Yes | String | `"The page title field is required."` / `"The page title must be a string."` |

### Security — Feedback
- Security payloads in `pages[].title` → never 500, stored safely
- Empty all-fields payload → 417 with per-field required errors

---

## 13. Shared Field Rules

Rules that apply across multiple resources:

### Title (generic)
- Required: `"The title field is required."`
- Max 255: `"The title may not be greater than 255 characters."`
- String type: `"The title must be a string."`

### Order (generic)
- Required: `"The order field is required."`
- Min 1 (resource-dependent, some allow 0): `"The order must be at least 1."` or `"The order must be at least 0."`
- Integer: `"The order must be an integer."`
- Number type check: `"The order must be a number."`
- Max 999999999: `"The order may not be greater than 999999999."`

### Status (generic)
- Required: `"The status field is required."`
- Invalid value: `"The selected status is invalid."`

### Version ID (generic)
- Integer: `"The version id must be an integer."`
- Min 1: `"The version id must be at least 1."`

### Message / Description
- Required (where applicable): `"The message field is required."`

### Colors
- Primary required: `"The primary color field is required."`
- Secondary required: `"The secondary color field is required."`

---

## 14. Security Payloads & Expected Behavior

The following payloads are used in security tests:

| Payload key | Value | Expected result on free-text fields | Expected result on constrained fields |
|-------------|-------|-------------------------------------|---------------------------------------|
| `xss` | `<script>alert('test')</script>` | 200 — stored safely | 417 or 422 — format rejection |
| `sql` | `' OR '1'='1` | 200 — stored safely | 417 or 422 — format rejection |
| `specialCharString` | `test@#$%` | 200 — stored safely | 417 — format rejection |
| `pathTraversal` | `../../etc/passwd` | 200 — stored safely | 417 or 422 — format rejection |

**Rule:** No input, regardless of content, should ever produce a 500 response.

### Path traversal in URL parameters
All of the following produce **404** (not 500, not 200):
- `../` in site_id or instance_id
- `%2e%2e%2f` (URL-encoded traversal)
- `%252e%252e%252f` (double URL-encoded traversal)
- Security payload `../../etc/passwd`
- Null byte `\x00` in URL → **400**

---

## 15. Common Error Codes

| HTTP Code | Meaning | When |
|-----------|---------|------|
| 200 | Success | Valid request |
| 400 | Bad Request | Null byte or malformed URL |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Feature disabled via setting |
| 404 | Not Found | Non-existent / deleted / cross-reseller resource |
| 405 | Method Not Allowed | Wrong HTTP verb for endpoint |
| 417 | Expectation Failed (Validation Error) | Field-level validation failure; check `body.body.<field>[0]` |
| 422 | Unprocessable Entity (Business Rule) | Enum/business rule violation; check `body.status.message` |
| 500 | Server Error | **Should never occur** — flag as a bug |

---

## Appendix: Pre-seeded Test Data

These IDs are referenced in the backend tests and may be useful for frontend integration testing:

| Resource | ID | Notes |
|----------|----|-------|
| `SITES.main` | 7 | Primary test site |
| `SITES.secondary` | 10 | Secondary test site |
| `SITES.deleted` | 11 | Soft-deleted site |
| `SITES.resellerSite` | 9 | Another reseller's site (inaccessible) |
| `THEMES.theme1` | `lyb-global-tile` | Valid layout value |
| `THEMES.theme2` | `lyb-global-tile-plus` | Valid layout value |
| Valid logo URL formats | `.jpg`, `.jpeg`, `.png`, `.svg` | Accepted by `logo_url` and `banner` fields |
