import dateFormat from './util/dateFormat';

export interface IManifest {
  version?: string,
  manifest: number,
  name: string,
  chip?: string,
  build_date: string,
  app_ver: string,
  project_id?: string,
  project_name?: string,
  license_key?: string,
  burner?: string,
  images: IImage[],
}

export interface IImage {
  name?: string,
  addr: string,
  size: number,
  md5: string,
  file: string
}

export const manifest: IManifest = {
  name: '',
  manifest: 2,
  app_ver: '',
  build_date: dateFormat('yyyy-MM-dd hh:mm:ss'),
  images: [],
}