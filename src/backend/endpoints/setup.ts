import http from "node:http";
import crypto from "node:crypto";

export default function (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }) {
    if (req.method !== "POST") return 405;
    const row = db.prepare("SELECT * FROM auth LIMIT 1;").get();
    if (row) {
        res.writeHead(302, { "Location": "/login" });
        res.end();
        return true;
    };

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
            console.log(body);

            if (!body.username || !body.password) {
                res.writeHead(400);
                res.end();
                return;
            }

            const row = db.prepare("SELECT * FROM auth LIMIT 1;").get();
            if (row) {
                res.writeHead(400);
                res.end();
                return;
            }

            db.sql`INSERT INTO auth (username, password_hash) VALUES (${body.username}, ${crypto.createHash('sha256').update(body.password).digest().toString('hex')});`;

            // create default characteristics


            res.writeHead(302, { "Location": "/login" });
            res.end();
        } catch (e) {
            console.error(e);
            res.writeHead(400);
            res.end();
        }
    });

    return true;
};