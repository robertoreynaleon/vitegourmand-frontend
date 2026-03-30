import axios from 'axios';

const API_URL = 'http://vitegourmand.local';

export async function loginUser(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
    });

    return {
        token: response.data.token,
        user: response.data.user,
    };
}
