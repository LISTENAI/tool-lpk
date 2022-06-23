import Lisa from '@listenai/lisa_core';
import { mkdirp } from 'fs-extra';
import { join, basename } from 'path';
import { IManifest, manifest, IImage } from './manifest';
import { binInfo, IFileInfo } from './util/utils';
import { getLSCloudProjectInfo, getVersion, getChip } from './util/ux';
import dateFormat from './util/dateFormat';

export default class Lpk {
    _zip: any;

    _manifest: IManifest;

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

}