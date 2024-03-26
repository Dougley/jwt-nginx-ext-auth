import Fastify from "fastify";
import { createRemoteJWKSet } from "jose";
import { JWTPayload, jwtVerify } from "jose";

const fastify = Fastify({
  logger: true,
});

const JWKS = createRemoteJWKSet(
  new URL("https://dougley.cloudflareaccess.com/cdn-cgi/access/certs"),
);

fastify.get<{
  Querystring: {
    iss?: JWTPayload["iss"];
    aud?: JWTPayload["aud"];
  };
  Headers: {
    authorization: string;
  };
}>("/", async (request, reply) => {
  const { payload, protectedHeader } = await jwtVerify(
    request.headers.authorization,
    JWKS,
    {
      issuer: request.query.iss,
      audience: request.query.aud,
    },
  );
  return { payload, protectedHeader };
});

fastify.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
