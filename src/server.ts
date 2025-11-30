import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import process from "node:process";
import mime from "mime-types";

type endpoint = (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, params: { [k: string]: string; }) => object | number;

const endpoints: {
    [key: string]: endpoint;
} = {};

// fs.watchFile(__filename, { interval: 100 }, () => process.exit(0));

process.on('uncaughtException', console.error);

const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "", "http://localhost/");
    let reqpath = url.pathname;
    const params = Object.fromEntries(url.searchParams.entries());
    if (reqpath === '/') reqpath = '/index.html';

    if (!reqpath.startsWith('/api/')) {
        if (!path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1)).startsWith(path.resolve(import.meta.dirname ?? "", "frontend"))) {
            res.writeHead(403, undefined);
            res.end();
            return;
        }

        if (!fs.existsSync(path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1)))) {
            res.writeHead(404, undefined);
            res.end();
            return;
        }

        const readStream = fs.createReadStream(path.resolve(import.meta.dirname ?? "", "frontend", reqpath.slice(1))).on('error', (err) => {
            console.error(err);
            res.writeHead(500, undefined);
            res.end();
            return;
        });

        res.writeHead(200, undefined, {
            "Content-Type": mime.lookup(reqpath)
        });
        readStream.pipe(res);
        return;
    } else {
        reqpath = reqpath.slice(5);

        if (typeof endpoints[reqpath] !== "function") { res.writeHead(404, undefined); res.end(); return; }

        try {
            const response = endpoints[reqpath](req, res, params);
            if (typeof response === "number") {
                res.writeHead(response, undefined);
                res.end();
                return;
            }

            res.writeHead(200, "OK", { "Content-Type": "application/json", });
            res.end(JSON.stringify(response));
        } catch (e) {
            console.error(e);
            res.writeHead(500, undefined);
            res.end();
        }
        return;
    }
});

for (const { name: endpoint } of fs.readdirSync(path.join(import.meta.dirname ?? "", "./backend/endpoints/"), { withFileTypes: true }).filter(e => e.isFile)) {
    endpoints[path.parse(endpoint).name] = (await import("file://" + path.join(import.meta.dirname ?? "", "./backend/endpoints/", endpoint))).default;
}

server.listen(5813);