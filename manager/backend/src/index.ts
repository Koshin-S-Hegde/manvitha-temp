import type { Application, Request, Response } from "express"
import express from "express"
import fs from "fs"

const port = 5433;
const path = "/home/kosh/My-Folder/couple-orchestrator/manager/backend/"
const composePath = "/home/kosh/couple-orchestrator/docker-composes/"

const app: Application = express();
app.use(express.urlencoded({ extended: true }));

interface Worker {
    name: string,
    url: string,
}
app.use(express.json());

type Workers = Map<string, Worker>
const raw = JSON.parse(fs.readFileSync(path + "workers.json", "utf-8"))
const workers: Workers = new Map(
  Object.entries(raw).map(([key, value]) => [key, value as Worker])
);

app.post("/status", async (req: Request, res: Response) => {
    const { name, id } = req.body;
    const worker = workers.get(id)
    if (!worker) {
        res.send({
            success: 1,
            err_msg: "Worker doesn't exist",
        })
        return;
    }
    const { 
        status
    } = await (await fetch(
        worker.url + "status",
        {
            method: "POST",
            body: JSON.stringify({
                name: name,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    )).json()
    res.send({
        status: status
    })
});

app.post("/add-worker", (req: Request, res: Response) => {
    const { id, name, url } = req.body;
    workers.set(id, { name: name, url: url })
    fs.writeFileSync(
        path + "workers.json",
        JSON.stringify(Object.fromEntries(workers))
    )
    res.send()
})

app.post("/get-workers", (_: Request, res: Response) => {
    res.send(Object.fromEntries(workers))
})

app.post("/delete-worker", (req: Request, res: Response) => {
    const { id } = req.body;
    workers.delete(id)
    fs.writeFileSync(
        path + "workers.json",
        JSON.stringify(Object.fromEntries(workers))
    )
    res.send()
})

app.post("/log", async (req: Request, res: Response) => {
    const { name, id } = req.body;
    const worker = workers.get(id)
    if (!worker) {
        res.send({
            success: 1,
            err_msg: "Worker doesn't exist",
            out: "",
            err: "",
        })
        return;
    }
    const { 
        success,
        err_msg,
        out,
        err
    } = await (await fetch(
        worker.url + "log",
        {
            method: "POST",
            body: JSON.stringify({
                name: name,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    )).json()
    res.send({
        success: success,
        err_msg: err_msg,
        out: out,
        err: err,
    })
});

app.post("/up", async (req: Request, res: Response) => {
    const { name, id } = req.body;
    const worker = workers.get(id)
    if (!worker) {
        res.send({
            success: 1,
            err_msg: "Worker doesn't exist",
            out: "",
            err: "",
        })
        return;
    }
    const { 
        success,
        err_msg,
        out,
        err
    } = await (await fetch(
        worker.url + "up",
        {
            method: "POST",
            body: JSON.stringify({
                name: name,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    )).json()
    res.send({
        success: success,
        err_msg: err_msg,
        out: out,
        err: err,
    })
});

app.post("/down", async (req: Request, res: Response) => {
    const { name, id } = req.body
    const worker = workers.get(id)
    if (!worker) {
        res.send({
            success: 1,
            err_msg: "Worker doesn't exist",
            out: "",
            err: "",
        })
        return;
    }
    const { 
        success,
        err_msg,
        out,
        err
    } = await (await fetch(
        worker.url + "down",
        {
            method: "POST",
            body: JSON.stringify({
                name: name,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    )).json()
    res.send({
        success: success,
        err_msg: err_msg,
        out: out,
        err: err,
    })
});

app.post("/new-sandbox", (req: Request, res: Response) => {
    const { name, content } = req.body
    try {
        fs.mkdirSync(composePath + name)
    }
    catch {}
    fs.writeFileSync(composePath + name + "/docker-compose.yaml", content)
    res.send()
})

app.post("/get-sandboxs", (_: Request, res: Response) => {
    const dirs = fs
        .readdirSync(composePath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    res.send(dirs)
})

app.post("/delete-sandbox", (req: Request, res: Response) => {
    const { name } = req.body
    try {
        fs.rmSync(composePath + name, { recursive: true })
    }
    catch {
        res.send({
            success: 1
        })
        return
    }
    res.send({ success: 0 })
})

app.post("/get-compose", (req: Request, res: Response) => {
    const { name } = req.body
    try {
        res.send({
            success: 0,
            content: fs.readFileSync(composePath + name + "/docker-compose.yaml", "utf-8")
        })
    }
    catch {
        res.send({
            success: 1,
            content: ""
        })
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});
