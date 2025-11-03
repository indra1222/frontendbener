import { API_URL } from '../config/api';

export { API_URL };

export const api = {
  async predictBatch(items) {
    const response = await fetch(`${API_URL}/predict_batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return response.json();
  },

  async resetLayout() {
    const response = await fetch(`${API_URL}/reset`, {
      method: 'POST'
    });
    return response.json();
  }
};