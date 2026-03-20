const API_URL = 'http://192.168.128.65:3000';

async function apiFetch(endpoint, options={}) {
    const token = localStorage.getItem('token');

    const res = await fetch (`${API_URL}${endpoint}`,{
        ...options,
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if(res.status === 401){
        localStorage.clear();
        window.location.href = 'register-login.html';
    }

    return res;
}