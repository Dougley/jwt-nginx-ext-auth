# JWK Validation for Nginx External Authentication

This is a simple way to validate JSON Web Keys (JWK) in Nginx using [Nginx External Authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/). This also works with [ingress-nginx](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md#external-authentication).

## Gotchas

Keep in mind that this service is purely meant to **validate** already signed tokens. It does not sign tokens or provide any other functionality. Your IdP should do more granular access control, and this service should only be used to validate the token signature.

Ideally, your IdP has [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) compliant discovery endpoint, and it at least exposes the `issuer` and `jwks_uri` fields. If your IdP does not provide a OIDC Discovery endpoint, you can still use this service by providing the JWK URI and issuer manually.

## Usage

> **Note**
> Using Kubernetes? Use [Helm](https://helm.sh/) to deploy this service. Check out the [Helm chart]().

1. Clone this repository
