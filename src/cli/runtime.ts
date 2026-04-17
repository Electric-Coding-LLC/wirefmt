import { Buffer } from "node:buffer";

export interface CliRuntime {
  readFile(path: string): Promise<string>;
  readStdin(): Promise<string>;
  writeStdout(text: string): void;
  writeStderr(text: string): void;
}

export const defaultRuntime: CliRuntime = {
  async readFile(path) {
    return Bun.file(path).text();
  },
  async readStdin() {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf8");
  },
  writeStdout(text) {
    process.stdout.write(text);
  },
  writeStderr(text) {
    process.stderr.write(text);
  },
};
