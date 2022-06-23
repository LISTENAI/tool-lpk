import Lisa from '@listenai/lisa_core'
import cookie from './cookie'

async function getLogToken(id: number | string) {
  try {
    const { body } = await Lisa.got.post(`https://api.iflyos.cn/external/ls_log/client/get_token`, {
      headers: {
        Authorization: `Bearer ${await cookie.getAccessToken()}`,
      },
      json: {
        project_id: id
      },
      responseType: 'json'
    });
    return (body as any)?.token
  } catch (error: any) {
    if (error.message.indexOf('code 400')) {
      console.log('该账号无该项目访问权限，请确认打包账号或LSCloud项目id')
    } else if (error.message.indexOf('code 401')) {
      console.log('登录态已过期，请执行 lisa login 重新登录')
    }
    
    return false
  }
}

export default getLogToken