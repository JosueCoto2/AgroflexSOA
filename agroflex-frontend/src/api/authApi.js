import axiosClient from './axiosClient'

const authApi = {
  login: (correo, password) => {
    return axiosClient.post('/api/auth/login', {
      correo,
      password,
    })
  },

  register: (data) => {
    return axiosClient.post('/api/auth/register', data)
  },

  enviarCodigo: (correo) => {
    return axiosClient.post('/api/auth/enviar-codigo', { correo })
  },

  refreshToken: (token) => {
    return axiosClient.post('/api/auth/refresh', {
      refreshToken: token,
    })
  },

  forgotPassword: (correo) => {
    return axiosClient.post('/api/auth/forgot-password', {
      correo,
    })
  },

  resetPassword: (token, newPassword) => {
    return axiosClient.post('/api/auth/reset-password', {
      token,
      newPassword,
    })
  },

  solicitarInsignia: (data) => {
    return axiosClient.post('/api/auth/solicitar-insignia', data)
  },

  loginConGoogle: (idToken) => {
    return axiosClient.post('/api/auth/google', { idToken })
  },
}

export default authApi
