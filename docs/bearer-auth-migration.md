# Bearer Token Auth Migration

## Summary

Replace the custom `x-api-key` header with the RFC 6750 standard `Authorization: Bearer <token>` scheme.
This enables the Swagger UI "Authorize" button and aligns with industry-standard tooling.

---

## Files to Change

### 1. `backend/api/middleware.py`

**What:** Extract token from `Authorization` header instead of `x-api-key`.

```python
# Before (line 34)
api_key = request.headers.get(self.api_key_header)
if not api_key:
    return JSONResponse(status_code=401, content={"detail": f"Missing {self.api_key_header} header"})

# After
auth_header = request.headers.get("authorization", "")
if not auth_header.lower().startswith("bearer "):
    return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header. Use: Bearer <token>"})
api_key = auth_header[7:]  # strip "Bearer "
```

The `__init__` signature can drop `api_key_header` entirely — the header name is no longer configurable.

---

### 2. `backend/core/config.py`

**What:** Remove `api_key_header` setting (no longer needed).

```python
# Remove this line:
api_key_header: str = "x-api-key"
```

`auth_exempt_paths` and all other settings stay unchanged.

---

### 3. `backend/api/main.py`

**What:**
- Remove `api_key_header` kwarg from middleware registration.
- Add `HTTPBearer` OpenAPI security scheme so Swagger UI renders "Authorize".

```python
# middleware registration — remove api_key_header kwarg
app.add_middleware(
    ApiKeyAuthMiddleware,
    exempt_paths=settings.auth_exempt_paths,
)

# Add security scheme to FastAPI constructor
from fastapi.security import HTTPBearer

security = HTTPBearer()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)
```

Each route that should show the lock icon in Swagger adds `dependencies=[Depends(security)]`,
or declare it globally via `app = FastAPI(..., dependencies=[Depends(security)])`.

---

### 4. `backend/tests/test_preflight.py`

**What:** Update every test that sets `x-api-key` to send `Authorization: Bearer <token>` instead.

```python
# Before (repeated across ~10 test cases)
headers={"x-api-key": BOOTSTRAP_KEY}

# After
headers={"Authorization": f"Bearer {BOOTSTRAP_KEY}"}
```

Affects lines: 104, 123, 142, 162, 185, 207, 228, 245, 264, 281.

---

### 5. `backend/.env.example`

**What:** Remove `API_KEY_HEADER` — it no longer drives behavior.

```diff
- API_KEY_HEADER=x-api-key
```

---

### 6. `backend/docker-compose.yml`

**What:** Remove `API_KEY_HEADER` env var from `api` and `worker` service definitions.

```diff
- API_KEY_HEADER: x-api-key
```

---

## No-Change Areas

| Area | Reason |
|---|---|
| `core/security.py` — `hash_api_key()` | Token is still SHA256-hashed; logic identical |
| `db/mongodb.py` — `bootstrap_api_key()` | Bootstrap key value unchanged |
| `db/versions/` — all migrations | No schema change |
| `api/schemas/` | No request/response shape change |
| All other route files | Auth handled entirely in middleware |

---

## Testing Checklist

- [ ] `GET /v1/health` still returns 200 without any auth header (exempt path)
- [ ] `GET /docs` still accessible without auth (exempt path)
- [ ] `POST /v1/runs` returns 401 with no header
- [ ] `POST /v1/runs` returns 401 with `x-api-key` header (old clients rejected)
- [ ] `POST /v1/runs` returns 401 with `Authorization: Bearer bad_token`
- [ ] `POST /v1/runs` returns 201 with `Authorization: Bearer lmai_dev_key`
- [ ] Swagger UI "Authorize" button accepts token and sends correct header
- [ ] All existing pytest tests pass after header update
