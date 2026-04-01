const API_BASE = 'http://vitegourmand.local/api/user';

export async function updateMe(token, formData) {
    const response = await fetch(`${API_BASE}/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
}
