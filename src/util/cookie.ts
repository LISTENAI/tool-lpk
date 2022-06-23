import * as Configstore from 'configstore';

const cookie = {
  getAccessToken: async () => {
    const config = new Configstore('lisa')
    return (config.get('userInfo') || {}).accessToken || (config.get('lisaUserInfo') || {}).accessToken
  }
}

export default cookie
