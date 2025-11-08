const API_URL = SERVER_URL; // Will need to define what server url is

let authToken = null;

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.token) {
            authToken = data.token;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error: ', error);
        return false;
    }
};

export const register = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return response.ok;
    } catch (error) {
        console.error('Register error: ', error);
        return false;
    }
};

export const syncStepsToServer = async (steps) => {
    try {
        const response = await fetch(`${API_URL}/steps/update`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                steps,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Step sync error: ', error);
    }
};

export const fetchCharacterData = async () => {
    try {
        const response = await fetch(`${API_URL}/character`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Fetch character data error: ', error);
        return null;
    }
};

export const fetchFriends = async () => {
    try {
        const response = await fetch(`${API_URL}/friends`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Fetch character data error: ', error);
        return [];
    }
};

export const addFriends = async (fid) => {
    try {
        const response = await fetch(`${API_URL}/friends/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ fid })
        });
        return response.ok;
    } catch (error) {
        console.error('Add friend error: ', error);
        return false;
    }
};

export const fetchCurrentBoss = async () => {
    try {
        const response = await fetch(`${API_URL}/boss/current`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Fetch boss error: ', error);
        return null;
    }
};

export const attackBoss = async () => {
    try {
        const response = await fetch(`${API_URL}/steps/update`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Attack boss error: ', error);
        return { hit: false };
    }
};