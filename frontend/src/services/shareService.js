import axios from "axios";

const API_URL = "http://localhost:5000/api/shares";

export const getAllShares = async () => {
  const response = await axios.get(
    "http://localhost:5000/api/shares"
  );
  return response.data;
};

export const getShareDetails = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const getShareTransactions = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}/transactions`
  );
  return response.data;
};