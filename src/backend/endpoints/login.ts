import http from "node:http";
import crypto from "node:crypto";

export default function (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }) {
    if (req.method !== "POST") return 405;
    const row = db.prepare("SELECT * FROM auth LIMIT 1;").get();
    if (!row) return 500;

    let data = "";
    req.on('data', chunk => {
        data += chunk;

        if (data.length > 1000 * 1000) {
            res.writeHead(413);
            res.end();
            req.destroy();
        }
    });
    req.on('end', () => {
        try {
            const body = Object.fromEntries(new URLSearchParams(data).entries());

            if (!body.username || !body.password) {
                res.writeHead(400);
                res.end();
                return;
            }

            if (row.username?.toLowerCase() !== body.username.toLowerCase() || row.password_hash !== crypto.createHash('sha256').update(body.password).digest().toString('hex')) {
                res.writeHead(302, { "Location": "/login?r=1" });
                res.end();
                return;
            }

            const session_token = crypto.randomBytes(64).toString('hex');
            const expires_at = Date.now() + 1000 * 60 * 60 * 24 * 365;
            db.sql`INSERT INTO sessions (token, expires_at) VALUES (${session_token}, ${expires_at});`;

            res.setHeader("Set-Cookie", `token=${session_token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 365}`);

            res.writeHead(302, { "Location": "/" });
            res.end();
        } catch (e) {
            console.error(e);
            res.writeHead(400);
            res.end();
        }
    });

    return true;
};