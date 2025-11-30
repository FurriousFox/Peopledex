import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import process from "node:process";
import mime from "mime-types";
import { Database } from "@db/sqlite";

const db = new Database(path.join(import.meta.dirname ?? "", "./peopledex.db"), {
    create: true,
    readonly: false,
    memory: false,
    int64: true,
    parseJson: true,
});

declare global {
    var db: Database;
}
globalThis.db = db;

let exit;
process.on('exit', exit = () => { db.close(); process.exit(0); });
process.on('SIGINT', exit);
process.on('SIGTERM', exit);
process.on('SIGQUIT', exit);

await import("./init.ts");

import auth from "./auth.ts";


type endpoint = (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, params: { [k: string]: string; }) => object | number | true;

const endpoints: {
    [key: string]: endpoint;
} = {};

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);


const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost/");
    if (auth(req, res, url)) return;

    let reqpath = url.pathname;
    const params = Object.fromEntries(url.searchParams.entries());
    if (reqpath === '/') reqpath = '/index.html';

    if (!reqpath.startsWith('/api/')) {
        if (!path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1)).startsWith(path.resolve(import.meta.dirname ?? "", "frontend"))) {
            res.writeHead(403);
            res.end();
            return;
        }

        if (!fs.existsSync(path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1)))) {
            if (fs.existsSync(path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1) + ".html"))) {
                reqpath = reqpath + ".html";
            } else {
                res.writeHead(404);
                res.end();
                return;
            }
        }

        const readStream = fs.createReadStream(path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1))).on('error', (err) => {
            console.error(err);
            res.writeHead(500);
            res.end();
            return;
        });

        res.writeHead(200, "OK", {
            "Content-Type": `${mime.lookup(reqpath) || 'application/octet-stream'}`
        });
        readStream.pipe(res);
        return;
    } else {
        reqpath = reqpath.slice(5);

        if (typeof endpoints[reqpath] !== "function") { res.writeHead(404); res.end(); return; }

        try {
            const response = endpoints[reqpath](req, res, params);
            if (typeof response === "number") {
                res.writeHead(response);
                res.end();
                return;
            } else if (response === true) {
                return;
            }

            res.writeHead(200, "OK", { "Content-Type": "application/json" });
            res.end(JSON.stringify(response));
        } catch (e) {
            console.error(e);
            res.writeHead(500);
            res.end();
        }
        return;
    }
});

for (const { name: endpoint } of fs.readdirSync(path.join(import.meta.dirname ?? "", "./backend/endpoints/"), { withFileTypes: true }).filter(e => e.isFile)) {
    endpoints[path.parse(endpoint).name] = (await import("file://" + path.join(import.meta.dirname ?? "", "./backend/endpoints/", endpoint))).default;
}

server.listen(5813, "127.0.0.1");