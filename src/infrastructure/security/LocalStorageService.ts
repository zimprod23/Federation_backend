import fs from "fs/promises";
import path from "path";
import { IStorageService } from "../../domain/interfaces";

export class LocalStorageService implements IStorageService {
  constructor(
    private readonly baseDir: string,
    private readonly baseUrl: string,
  ) {}

  async upload(
    key: string,
    buffer: Buffer,
    _mimeType: string,
  ): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return `${this.baseUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    await fs.rm(filePath, { force: true });
  }
}
