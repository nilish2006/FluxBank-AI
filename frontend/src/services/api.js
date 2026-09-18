import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
    getCustomers: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/customers`, { params });
        return response.data;
    },
    getCustomer: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/customers/${id}`);
        return response.data;
    },
    getRecommendation: async (customerData) => {
        const response = await axios.post(`${API_BASE_URL}/recommend`, customerData);
        return response.data;
    },
    getRecommendations: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/recommendations`, { params });
        return response.data;
    },
    getAnalytics: async () => {
        const response = await axios.get(`${API_BASE_URL}/analytics`);
        return response.data;
    },
    analyzeSentiment: async (text, context = {}) => {
        const response = await axios.post(`${API_BASE_URL}/voice/analyze`, { text, ...context });
        return response.data;
    },
    getHealth: async () => {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
    }
};
