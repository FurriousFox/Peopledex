import http from "node:http";

export default async function (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, params: { [k: string]: string; }) {
    type person = {
        id: number;
        name: string;
        characteristics: {
            id?: number;
            person_id: number;
            characteristic_id: number;
            value: string;
        }[];
    };

    const body: object | number = await new Promise((resolve) => {
        let data = "";

        req.on('data', chunk => {
            data += chunk;

            if (data.length > 1000 * 1000) {
                // probably needs a better way to handle bigger texts / images etc

                res.writeHead(413);
                res.end();
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                // const body = Object.fromEntries(new URLSearchParams(data).entries());
                const body = data ? JSON.parse(data) : {};
                resolve(body);
            } catch (e) {
                console.error(e);
                res.writeHead(400);
                res.end();
                resolve(400);
            }
        });
    });
    if (typeof body === "number") return body;

    if (req.method == "GET") {
        let people: { id: number; }[] | person[];
        if (params.id) {
            people = db.sql`SELECT * FROM people WHERE id = ${params.id};`;
        } else people = db.sql`SELECT * FROM people;`;

        people = people.map(e => {
            const characteristics = db.sql`SELECT * FROM characteristic_values WHERE person_id = ${e.id};`;
            return {
                ...e,
                characteristics: characteristics,
            };
        }) as person[];

        if (params.id) return people[0] ?? [];
        return people;
    } else if (req.method == "PATCH") {
        if (!params.id) return 400;
        const person = body as person;
        if (!person.characteristics) person.characteristics = [];
        if (!(person.characteristics instanceof Array)) return 400;

        if (person.characteristics.filter(c => typeof c.characteristic_id !== "number" || typeof c.value !== "string").length > 0) return 400;

        if (person.name !== undefined) {
            db.prepare(`UPDATE people SET name = :name WHERE id = :id;`).run({
                name: person.name,
                id: params.id,
            });
        }

        // Remove all existing characteristics
        db.prepare(`DELETE FROM characteristic_values WHERE person_id = ?;`).run(params.id);

        // Add all new characteristics
        for (const char of person.characteristics) {
            db.prepare(`
                INSERT INTO characteristic_values (person_id, characteristic_id, value)
                VALUES (:person_id, :characteristic_id, :value);
            `).run({
                person_id: params.id,
                characteristic_id: char.characteristic_id,
                value: char.value,
            });
        }

        return 200;
    } else if (req.method == "POST") {
        const person = body as person;
        if (Object.hasOwn(person, "id")) return 400;
        if (!person.name || typeof person.name !== "string") return 400;
        if (!person.characteristics) person.characteristics = [];
        if (!(person.characteristics instanceof Array)) return 400;

        if (person.characteristics.filter(c => typeof c.characteristic_id !== "number" || typeof c.value !== "string").length > 0) return 400;

        db.prepare("INSERT INTO people (name) VALUES (:name);").run({ name: person.name });
        const person_id = db.lastInsertRowId;

        for (const char of person.characteristics) {
            db.prepare(`
                INSERT INTO characteristic_values (person_id, characteristic_id, value)
                VALUES (:person_id, :characteristic_id, :value);
            `).run({
                person_id: person_id,
                characteristic_id: char.characteristic_id,
                value: char.value,
            });
        }

        return { id: person_id, name: person.name, characteristics: person.characteristics };
    } else if (req.method == "DELETE") {
        if (!params.id) return 400;

        const result = db.prepare("DELETE FROM people WHERE id = ?;").run(params.id);
        return (result > 0) ? 200 : 500;
    } else {
        return 405;
    }

};