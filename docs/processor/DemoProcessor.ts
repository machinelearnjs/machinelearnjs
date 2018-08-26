import * as fs from 'fs';
import * as path from 'path';
import { BaseProcesser } from "./BaseProcesser";

export class DemoProcessor extends BaseProcesser {
  private modulesPath = path.join(__dirname, '../../src/lib');
  public run(): void {
    const modules = fs.readdirSync(this.modulesPath);
    console.log(modules);
  }
}
