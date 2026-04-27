import type { Application, Request, Response } from "express";
import { up, down, log } from "./worker"
import express from "express";

const app: Application = express();
const port = 5431;
const busy = new Map<string, string>()

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.post('/status', (req: Request, res: Response) => {
    const { name } = req.body
    res.send({
        status: busy.has(name) ? busy.get(name) : "free",
    })
});

app.post('/up', (req: Request, res: Response) => {
    const { name } = req.body;
    if (busy.has(name)) {
        res.send({
            success: 1,
            err_msg: busy.get(name),
        })
        return;
    }
    busy.set(name, "up")
    up(name, () => {
        busy.delete(name)
    })
    res.send({
        success: 0,
        err_msg: "success",
    })
});

app.post('/down', (req: Request, res: Response) => {
    const { name } = req.body;
    if (busy.has(name)) {
        res.send({
            success: 1,
            err_msg: busy.get(name),
        })
        return;
    }
    busy.set(name, "down")
    down(name, () => {
        busy.delete(name)
    })
    res.send({
        success: 0,
        err_msg: "success",
    })
});

app.post('/log', (req: Request, res: Response) => {
    console.log(req.body)
    const { name } = req.body;
    if (busy.has(name)) {
        res.send({
            success: 1,
            err_msg: busy.get(name),
        })
        return;
    }
    busy.set(name, "log")
    log(name, (out: string, err: string) => {
        busy.delete(name)
        res.send({
            success: 0,
            err_msg: "success",
            out: out,
            err: err,
        })
    })
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
