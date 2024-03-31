# JWK Validation for Nginx External Authentication

This is a simple way to validate JSON Web Keys (JWK) in Nginx using [Nginx External Authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/). This also works with [ingress-nginx](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md#external-authentication).

## Gotchas

Keep in mind that this service is purely meant to **validate** already signed tokens. It does not sign tokens or provide any other functionality. Your IdP should do more granular access control, and this service should only be used to validate the token signature.

Ideally, your IdP has a [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) compliant discovery endpoint, and it at least exposes the `issuer` and `jwks_uri` fields. If your IdP does not provide a OIDC Discovery endpoint, you can still use this service by providing the JWK URI and issuer manually.

## Setup

> [!NOTE]
> Using Kubernetes? Use [Helm](https://helm.sh/) to deploy this service. Check out the [Helm chart]().

1. Clone this repository
2. Find your IdP's OIDC Discovery endpoint or JWK URI. For example, Google's OIDC Discovery endpoint is `https://accounts.google.com/.well-known/openid-configuration`, it's JWK URI is `https://www.googleapis.com/oauth2/v3/certs`.
   - If your IdP does not provide a OIDC Discovery endpoint, you should set a default issuer and JWK URI manually. The issuer is optional, but recommended.
3. Run the service with the following environment variables:
   - `OIDC_DISCOVERY_URI`: The URI to the OIDC Discovery endpoint. **Recommended way to configure**. For example, `https://accounts.google.com/.well-known/openid-configuration`.
   - `JWK_URI`: The URI to the JWK set. For example, `https://www.googleapis.com/oauth2/v3/certs`. Only required if `OIDC_DISCOVERY_URI` is not set.
   - `JWT_ISSUER`: The default issuer of the JWT. Optional. Gets automatically populated if `OIDC_DISCOVERY_URI` is set.
   - `JWT_AUDIENCE`: The audience tag that the JWT should have. Optional.
   - `JWT_HEADER`: The header to look for the JWT in. Default is `Authorization`.
   - `PORT`: The port to listen on. Default is `8080`.

`JWT_AUDIENCE` and `JWT_ISSUER` can be overridden by using the `aud` and `iss` query parameters in the request, this is useful if you have multiple audiences or issuers.

# Usage

Since this service is meant to be used with Nginx External Authentication, you should configure your Nginx to use this service as an external auth provider. Here is an example configuration:

```nginx
location / {
    auth_request /auth;
    error_page 401 = /auth_error;

    # Your application
    proxy_pass http://your_application;
}

location = /auth {
    internal;
    proxy_pass http://localhost:8080;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
```