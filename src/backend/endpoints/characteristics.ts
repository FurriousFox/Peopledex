import http from "node:http";

type characteristic = {
    id: number;
    name: string;
    type: string;
    exclusive: boolean;
    metadata: string;
    system: boolean;
    default: boolean;
};

export default function (req: http.IncomingMessage, _res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, params: { [k: string]: string; }) {
    if (req.method == "GET") {
        let characteristics: characteristic[];
        if (params.id) {
            characteristics = db.sql`SELECT * FROM characteristics WHERE id = ${params.id};`;
        } else {
            characteristics = db.sql`SELECT * FROM characteristics;`;
        }

        if (params.id) return characteristics[0] ?? [];
        return characteristics;
    } else {
        return 405;
    }
};
