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

export default async function auth(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, url: URL): Promise<boolean> {
    let row: object | undefined | number = -1;
    if (url.pathname === "/login") {
        row = db.prepare("SELECT * FROM auth LIMIT 1;").get();
        if (!row) {
            res.writeHead(302, { "Location": "/setup" });
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

    res.end("Not implemented");

    return true;
}