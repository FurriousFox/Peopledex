import http from "node:http";

const whitelist = [
    "/api/login",
    "/api/setup",
    "/setup",
    "/login",
    "/franken-ui.css",
    "/franken-ui-tailwind.css",
    "/style.css",
    "/setup.css",
    "/core.iife.js",
    "/icon.iife.js",
];

export default function auth(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, url: URL): boolean {
    let row: object | undefined | number = -1;
    if (url.pathname === "/login") {
        row = db.prepare("SELECT * FROM auth LIMIT 1;").get();
        if (!row) {
            res.writeHead(302, { "Location": "/setup" });
            res.end();
            return true;
        }
    } else if (url.pathname === "/setup") {
        row = db.prepare("SELECT * FROM auth LIMIT 1;").get();
        if (row) {
            res.writeHead(302, { "Location": "/login" });
            res.end();
            return true;
        }
    }

    if (whitelist.includes(url?.pathname)) return false;

    row = row == -1 ? db.prepare("SELECT * FROM auth LIMIT 1;").get() : row;
    if (!row) {
        res.writeHead(302, { "Location": "/setup" });
        res.end();
        return true;
    }

    const cookies = req.headers.cookie?.split(";").reduce((acc, cookie) => {
        const parts = cookie.trim().split("=");
        const key = parts[0];
        const value = parts.slice(1).join("=");
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>) || {};

    const token = cookies["token"];
    if (!token) {
        res.writeHead(302, { "Location": "/login" });
        res.end();
        return true;
    }

    const session = db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > ?;").get(token, Date.now());
    if (session) {
        return false;
    } else {
        res.writeHead(302, { "Location": "/login" });
        res.end();
        return true;
    }
}