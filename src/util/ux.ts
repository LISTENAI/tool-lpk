/**
 * 和用户交互的界面，注意本代码必须经过自动化测试，不要想当然不写测试代码
 */

 import * as inquirer from 'inquirer'
import getLogToken from './getLogToken'

export interface ProjectInfo {
  project_id: string;
  project_name: string;
  license_key: string;
}

export const getLSCloudProjectInfo = async (): Promise<ProjectInfo> => {

  let id: string|number = '';
  let name: string = '';
  let license_key: string = '';

  while (true) {

    let info = await inquirer.prompt([
      // {
      //   name: 'enabled',
      //   type: 'confirm',
      //   message: '是否需要上传量产日志到LSCloud'
      // },
      {
        name: 'id',
        type: 'input',
        message: '请输入LSCloud项目id',
        // when: (info) => {
        //   return info.enabled
        // }
      },
      {
        name: 'name',
        type: 'input',
        message: '请输入LSCloud项目名称',
        when: (info) => {
          return info.id
        }
      }
    ])
    // if (!info.enabled) {
    //   break;
    // }
    license_key = await getLogToken(info.id) || ''
    if (license_key) {
      id = info.id;
      name = info.name;
      break;
    }
  }


  return {
    project_id: id+'',
    project_name: name,
    license_key: license_key
  }
  
}

export const getVersion = async (): Promise<string> => {
  const info = await inquirer.prompt({
    name: 'version',
    type: 'input',
    message: '请输入固件版本',
    default: '1.0.0'
  })
  return info.version;
}

export const getChip = async (): Promise<string> => {
  const info = await inquirer.prompt({
    name: 'chip',
    type: 'input',
    message: '请输入芯片模组',
    default: 'csk6002'
  })
  return info.chip;
}