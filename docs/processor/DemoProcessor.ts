import * as fs from 'fs';
import * as path from 'path';
import { BaseProcesser } from "./BaseProcesser";

export class DemoProcessor extends BaseProcesser {
  private modulesPath = path.join(__dirname, '../../src/lib');
  public run(): void {
    const modules = fs.readdirSync(this.modulesPath);
    // Retrieving the full module paths
    const modulesPath = modules.map(mod => path.join(this.modulesPath, mod));
    // Retrieving the full demo paths
    const modulesDemoPath = modulesPath.map(mod => path.join(mod, '/demos'));
    modulesDemoPath.forEach((mod) => {
      if (fs.existsSync(mod)) {
        const z = fs.readdirSync(mod);
        console.log(mod, z);
      }
    });
    console.log(modulesPath);
  }
}
