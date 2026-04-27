import { spawn } from "child_process";

const path = `/home/kosh/couple-orchestrator/docker-composes/`;

export function up(iname: string, callback: () => void) {
    console.log("Worker class started : up", iname)
    const proc = spawn("docker-compose", ["-f", path + iname + "/docker-compose.yaml", "up", "-d"]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    proc.on("close", () => {
        console.log("Worker class : finished up", iname)
        callback()
        console.log("up name stdout :", stdout)
        console.log("up name stderr :", stderr)
    });
}

export function down(iname: string, callback: () => void) {
    console.log("Worker class started : down", iname)
    const proc = spawn("docker-compose", ["-f", path + iname + "/docker-compose.yaml", "down"]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    proc.on("close", () => {
        console.log("Worker class : finished down", iname)
        callback()
        console.log("up name stdout :", stdout)
        console.log("up name stderr :", stderr)
    });
}

export function log(iname: string, callback: (out: string, err: string) => void) {
    console.log("Worker class started : log", iname)
    const proc = spawn("docker-compose", ["-f", path + iname + "/docker-compose.yaml", "logs"]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    proc.on("close", () => {
        console.log("Worker class : finished log", iname)
        callback(stdout, stderr)
    });
}
