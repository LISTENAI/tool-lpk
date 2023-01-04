import Lisa from '@listenai/lisa_core';
import {mkdirp, pathExists, readFile} from 'fs-extra';
import { join, basename } from 'path';
import { IManifest, manifest, IImage } from './manifest';
import { binInfo, IFileInfo } from './util/utils';
import { getLSCloudProjectInfo, getVersion, getChip } from './util/ux';
import dateFormat from './util/dateFormat';
import {tmpdir} from "os";

export default class Lpk {
    _zip: any;

    _manifest: IManifest;

    _lpk_path: string | undefined;
    _tmp_path: string | undefined;

    constructor(option?: IManifest) {
        this._zip = Lisa.fs.project.zip();
        this._manifest = manifest;
        this._manifest.version = option?.version ?? '';
        this._manifest.name = option?.name ?? '';
        this._manifest.chip = option?.chip ?? '';
        this._manifest.app_ver = option?.app_ver ?? '';
    }

    async setLSCloudInfo() {
        const projectInfo = await getLSCloudProjectInfo()
        if (projectInfo.license_key) {
            this._manifest.name = projectInfo.project_name
            this._manifest.project_id = projectInfo.project_id
            this._manifest.project_name = projectInfo.project_name
            this._manifest.license_key = projectInfo.license_key;
        }
    }

    async setVersion() {
        this._manifest.version = await getVersion();
    }

    setName(name: string) {
        this._manifest.name = name;
    }

    async setChip(chip: string) {
        chip = chip ?? await getChip();
        this._manifest.chip = chip;

    }

    setAppver(appver: string) {
        this._manifest.app_ver = appver;
    }

    async addImage(file: string, addr: string) {
        const fileInfo: IFileInfo = await binInfo(file);
        const image: IImage = {
            name: basename(file),
            addr: addr,
            size: fileInfo.size,
            md5: fileInfo.md5,
            file: `./images/${basename(file)}`
        }
        this._manifest.images.push(image);
        this.addFile(file, 'images');
    }

    addFile(file: string, target?: string) {
        this._zip.addLocalFile(file, target || '');
    }

    async pack(target: string) {

        if (process.env.NODE_ENV === 'test') {
            return this._manifest;
        }
        this._zip.addFile(
            'manifest.json',
            Buffer.from(JSON.stringify(this._manifest, null, '\t'))
        );
        await mkdirp(target);
        const date = dateFormat('yyyyMMdd-hh-mm');
        const targetPath = join(target, `./${this._manifest.name}-${this._manifest.version}-${date}-factory.lpk`);
        this._zip.writeZip(targetPath);
        return targetPath;
    }

    async load(lpk_path: string) {
        this._lpk_path = lpk_path;

        if (!this._lpk_path) {
            console.error('未指定lpk路径');
            return;
        }
        const date = dateFormat('yyyyMMddhhmmss');
        this._tmp_path = join(tmpdir(), `lpk_${date}`);
        await Lisa.fs.project.unzip(this._lpk_path, this._tmp_path);

        const manifestPath = join(this._tmp_path, 'manifest.json');
        if (!(await pathExists(manifestPath))) {
            console.error('manifest.json不存在');
            return;
        }

        const intendedManifest: IManifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
        for (const img of intendedManifest.images) {
            const imgPath: string = join(this._tmp_path, img.file);
            if (!(await pathExists(imgPath))) {
                console.error(`镜像文件不存在。Path = ${imgPath}`);
                return;
            }
            const fileInfo: IFileInfo = await binInfo(imgPath);
            if (fileInfo.size !== img.size || fileInfo.md5 !== img.md5) {
                console.error(`镜像文件校验失败。Path = ${imgPath}, 
Documented MD5 = ${img.md5}, 
Actual MD5 = ${fileInfo.md5}, 
Documented size = ${img.size}, 
Actual size = ${fileInfo.size}\n`);
                return;
            }
        }

        this._manifest = intendedManifest;
    }
}
