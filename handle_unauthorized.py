def handle_unauthorized(error: Exception):
    # 401 = unauthenticated, 403 = authenticated but forbidden
    msg = str(error)
    if "Missing Bearer token" in msg or "Invalid token" in msg:
        return {"statusCode": 401, "body": "Unauthorized"}

    return {"statusCode": 403, "body": "Forbidden"}

# UI behaviour: redirect users with 403 (no RBAC roles) to an Unauthorized Access page.