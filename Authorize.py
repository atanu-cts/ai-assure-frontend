Authorize.py
# Dependencies: pip install pyjwt requests cryptography

import time
import requests
import jwt
from jwt import PyJWKClient

TENANT_ID = "<entra-tenant-id>"
API_AUDIENCE = "<api-client-id-or-app-id-uri>"
ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
DISCOVERY_URL = f"{ISSUER}/.well-known/openid-configuration"

# Cache these in-memory for efficiency (and refresh periodically)
_discovery_cache = {"value": None, "expires_at": 0}
_jwks_client_cache = {"value": None, "expires_at": 0}


def get_discovery(ttl_seconds: int = 3600):
    now = int(time.time())
    if _discovery_cache["value"] and now < _discovery_cache["expires_at"]:
        return _discovery_cache["value"]

    resp = requests.get(DISCOVERY_URL, timeout=10)
    resp.raise_for_status()
    _discovery_cache["value"] = resp.json()
    _discovery_cache["expires_at"] = now + ttl_seconds
    return _discovery_cache["value"]


def get_jwks_client(ttl_seconds: int = 3600):
    now = int(time.time())
    if _jwks_client_cache["value"] and now < _jwks_client_cache["expires_at"]:
        return _jwks_client_cache["value"]

    jwks_uri = get_discovery()["jwks_uri"]
    _jwks_client_cache["value"] = PyJWKClient(jwks_uri)
    _jwks_client_cache["expires_at"] = now + ttl_seconds
    return _jwks_client_cache["value"]


def extract_bearer_token(authorization_header: str) -> str:
    if not authorization_header or not authorization_header.startswith("Bearer "):
        raise PermissionError("Missing Bearer token")
    return authorization_header.split(" ", 1)[1].strip()


def validate_jwt(token: str) -> dict:
    jwks_client = get_jwks_client()
    signing_key = jwks_client.get_signing_key_from_jwt(token).key

    # Validates signature + exp/nbf + issuer + audience
    claims = jwt.decode(
        token,
        signing_key,
        algorithms=["RS256"],
        audience=API_AUDIENCE,
        issuer=ISSUER,
        options={"require": ["exp", "iat"], "verify_signature": True},
    )
    return claims


def get_user_identifier(claims: dict) -> str:
    # Prefer stable object id (oid)
    oid = claims.get("oid")
    if oid:
        return oid

    # Fallbacks (depends on Entra token configuration)
    return claims.get("preferred_username") or claims.get("email")


def load_rbac(conn, user_id: str) -> dict:
    # Example schema (illustrative): users, roles, user_roles
    # Return structure: {"roles": [...], "permissions": [...]}
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT r.name
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            JOIN users u ON u.id = ur.user_id
            WHERE u.entra_oid = %s OR u.email = %s
            """,
            (user_id, user_id),
        )
        roles = [row[0] for row in cur.fetchall()]

    return {"roles": roles, "permissions": []}


def authorize_request(request, conn):
    token = extract_bearer_token(request.headers.get("Authorization"))
    claims = validate_jwt(token)

    user_id = get_user_identifier(claims)
    if not user_id:
        raise PermissionError("Unable to determine user identity from token")

    rbac = load_rbac(conn, user_id)
    if not rbac["roles"]:
        raise PermissionError("Authenticated but not authorized (no roles)")

    # Attach to request context for downstream use
    request.context = getattr(request, "context", {})
    request.context["user"] = {"claims": claims, "id": user_id}
    request.context["rbac"] = rbac
    return True