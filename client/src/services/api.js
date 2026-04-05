import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const fileAPI = {
  getFiles: (parentId, targetUserId) => api.get('/files', { params: { parentId, targetUserId } }),
  createFolder: (data) => api.post('/files', data),
  uploadFile: (file, parentId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  downloadFile: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  renameFile: (id, name) => api.patch(`/files/${id}`, { name }),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

export const shareAPI = {
  shareFile: (data) => api.post('/shares', data),
  getReceivedShares: () => api.get('/shares/received'),
  getSentShares: () => api.get('/shares/sent'),
  markAsRead: (id) => api.patch(`/shares/${id}/read`),
  deleteShare: (id) => api.delete(`/shares/${id}`),
};

export const trustedUserAPI = {
  addTrustedUser: (data) => api.post('/trusted', data),
  getTrustedUsers: () => api.get('/trusted/trusted'),
  getTrustedByUsers: () => api.get('/trusted/trusted-by'),
  removeTrustedUser: (trustedUserId) => api.delete(`/trusted/${trustedUserId}`),
  checkTrustRelationship: (userId2) => api.get(`/trusted/check/${userId2}`),
};

export default api;