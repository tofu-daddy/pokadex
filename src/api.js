const BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchPokemonList(limit = 150, offset = 0) {
    try {
        const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results; // Returns array of {name, url}
    } catch (error) {
        console.error('Error fetching Pokemon list:', error);
        return [];
    }
}

export async function fetchPokemonDetails(urlOrId) {
    try {
        const url = typeof urlOrId === 'string' && urlOrId.startsWith('http')
            ? urlOrId
            : `${BASE_URL}/pokemon/${urlOrId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}

export async function fetchAllTypes() {
    try {
        const response = await fetch(`${BASE_URL}/type`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching types:', error);
        return [];
    }
}
