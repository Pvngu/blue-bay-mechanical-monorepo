const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Helper to get CSRF token from cookie
function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
            return decodeURIComponent(cookie.substring(name.length));
        }
    }
    return null;
}

// Helper to get headers with CSRF token
function getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
    
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return headers;
}

// Helper to handle responses
async function handleAuthResponse(response: Response) {
    // Si la respuesta es 204 No Content, devolver objeto vacío
    if (response.status === 204) {
        return {};
    }
    
    const data = await response.json();
    if (!response.ok) {
        throw { status: response.status, data };
    }
    return data;
}

const getCsrfCookie = async () => {
    try {
        const response = await fetch(`${baseURL}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            console.error('Error fetching CSRF cookie:', response.status);
        }
    } catch (error) {
        console.error('Error fetching CSRF cookie:', error);
        throw error;
    }
};

const login = async (credentials: { email: string; password: any }) => {
    await getCsrfCookie();
    return fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
        credentials: 'include',
    }).then(handleAuthResponse);
};

const logout = async () => {
    await getCsrfCookie();
    return fetch(`${baseURL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
    });
};

const getUser = async () => {
    return fetch(`${baseURL}/api/v1/user`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
    }).then(handleAuthResponse);
};

export const authService = {
    login,
    logout,
    getUser,
};