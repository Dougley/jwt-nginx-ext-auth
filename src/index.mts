import Fastify from "fastify";
import { JWTPayload, jwtVerify, createRemoteJWKSet } from "jose";

if (!process.env.JWKS_URI && !process.env.OIDC_DISCOVERY_URI) {
  console.error("JWKS_URI is required if OIDC_DISCOVERY_URI is not provided");
  process.exit(1);
}

if (process.env.OIDC_DISCOVERY_URI) {
  const discovery = await fetch(process.env.OIDC_DISCOVERY_URI);
  const discoveryJson = (await discovery.json()) as {
    jwks_uri: string;
    issuer: string;
  };
  console.log("Discovered JWKS_URI", discoveryJson.jwks_uri);
  console.log("Discovered issuer", discoveryJson.issuer);
  process.env.JWKS_URI = discoveryJson.jwks_uri;
  process.env.JWT_ISSUER = discoveryJson.issuer;
}

const fastify = Fastify({
  logger: true,
});

const JWKS = createRemoteJWKSet(new URL(process.env.JWKS_URI!));

fastify.get<{
  Querystring: {
    iss?: JWTPayload["iss"];
    aud?: JWTPayload["aud"];
  };
  Headers: {
    authorization: string;
  };
}>("/", async (request, reply) => {
  const header = (process.env.JWT_HEADER ?? "authorization").toLowerCase();
  if (!request.headers[header]) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }
  request.headers.authorization = Array.isArray(request.headers[header])
    ? request.headers[header]![0]
    : (request.headers[header] as string);
  const jwt = request.headers.authorization.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : request.headers.authorization;
  try {
    const { payload, protectedHeader } = await jwtVerify(jwt, JWKS, {
      issuer: request.query.iss ?? process.env.JWT_ISSUER ?? undefined,
      audience: request.query.aud ?? process.env.JWT_AUDIENCE ?? undefined,
    });
    return { payload, protectedHeader };
  } catch (e) {
    console.log("Verification failed", e);
    reply.status(401).send({ error: "Unauthorized" });
  }
});

fastify.listen(
  { port: +(process.env.PORT ?? 8080), host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  },
);
