import testU from "../utilTest.ts";
import http from "node:http";

export default function (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }, params: { [k: string]: string; }) {
    const test = 1;

    return { test, testUtil: testU(test) };
};