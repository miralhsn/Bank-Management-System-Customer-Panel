import axios from 'axios';

const API_URL = '/api/accounts';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const accountService = {
  getOverview: async () => {
    const response = await axios.get(`${API_URL}/overview`, getAuthHeader());
    return response.data;
  },

  getAccount: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  createAccount: async (accountData) => {
    const response = await axios.post(API_URL, accountData, getAuthHeader());
    return response.data;
  },

  updateAccount: async (id, updateData) => {
    const response = await axios.put(`${API_URL}/${id}`, updateData, getAuthHeader());
    return response.data;
  },

  getStatements: async (accountId, params) => {
    const response = await axios.get(
      `${API_URL}/${accountId}/statements`,
      {
        ...getAuthHeader(),
        params,
        responseType: params.format ? 'blob' : 'json'
      }
    );
    return response.data;
  }
}; 