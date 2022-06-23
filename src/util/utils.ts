import { readFile, stat } from 'fs-extra';
import * as crypto from 'crypto';

export interface IFileInfo {
  size: number,
  md5: string,
  gregText?: string
}

export async function binInfo(file: string, str?: string): Promise<IFileInfo> {
  var info: IFileInfo = {
    size: 0,
    md5: ''
  }
  var buffer = await readFile(file);
  var size = (await stat(file)).size;
  var fsHash = crypto.createHash('md5');

  fsHash.update(buffer);
  var md5 = fsHash.digest('hex');
  info.size = size;
  info.md5 = md5;

  if (str) {
    var start = buffer.indexOf(str) + str.length;
    if (start - str.length >= 0) {
      var end = -1;
      for (let i = start; i < buffer.length; i++) {
        if (buffer[i] === 0) {
          break;
        }
        end = i;
      }
      info.gregText = buffer.slice(start, end).toString();
    }
  }
  return info;
}