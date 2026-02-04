import { fetchPokemonDetails } from './api.js';

const TYPE_COLORS = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

// Helper to format ID
const formatId = (id) => `#${String(id).padStart(4, '0')}`;

export const createTypeBadge = (type) => {
    const color = TYPE_COLORS[type] || '#777';
    return `
    <span class="inline-block px-2 py-0.5 rounded text-xs font-bold text-white capitalize shadow-sm" style="background-color: ${color}; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
      ${type}
    </span>
  `;
};

export function renderGrid(pokemonList, container) {
    container.innerHTML = pokemonList.map(pokemon => {
        // We can extract ID from URL to get the image without fetching details yet
        // OR if we have the ID/details in the object, use that.
        const id = pokemon.id || pokemon.url.split('/').filter(Boolean).pop();
        const formattedId = formatId(id);
        const imageUrl =
            pokemon.sprites?.front_default ||
            pokemon.sprites?.other?.['official-artwork']?.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/${id}.png`;

        // Types rendering
        let typesHtml = '';
        if (pokemon.types) {
            typesHtml = pokemon.types.map(t => createTypeBadge(t.type.name)).join('');
        }

        // Determine URL for data attribute
        const dataUrl = pokemon.url || `https://pokeapi.co/api/v2/pokemon/${id}/`;

        return `
      <div class="pokemon-card group relative bg-surface border border-border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-accent hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:-translate-y-1" data-url="${dataUrl}" data-id="${id}">
        <div class="absolute top-2 right-3 font-mono text-secondary font-bold text-sm">${formattedId}</div>
        <div class="aspect-square mb-2 flex items-center justify-center">
            <img src="${imageUrl}" alt="${pokemon.name}" loading="lazy" class="pokemon-art w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110">
        </div>
        <h3 class="text-center font-bold text-lg capitalize mb-1">${pokemon.name}</h3>
        <div class="flex justify-center gap-1 flex-wrap mt-2" id="types-${id}">
           ${typesHtml}
        </div>
      </div>
    `;
    }).join('');
}

export async function hydratePokemonTypes(pokemonList) {
    // Check if we already have types rendered (optimization)
    // If renderGrid handled it, this might be redundant for those items.
    // But useful for initial partial loads.
    for (const p of pokemonList) {
        if (p.types) continue; // Skip if we already have data

        const id = p.url.split('/').filter(Boolean).pop();
        const element = document.getElementById(`types-${id}`);
        if (element && element.children.length === 0) {
            try {
                const details = await fetchPokemonDetails(p.url);
                if (details && details.types) {
                    element.innerHTML = details.types.map(t => createTypeBadge(t.type.name)).join('');
                }
            } catch (e) { console.error(e); }
        }
    }
}


export function renderModal(pokemon, species) {
    const flavorTextEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';

    const formattedId = formatId(pokemon.id);
    const typesHtml = pokemon.types.map(t => createTypeBadge(t.type.name)).join('');

    const statsHtml = pokemon.stats.map(s => {
        const name = {
            'hp': 'HP',
            'attack': 'ATK',
            'defense': 'DEF',
            'special-attack': 'SP.ATK',
            'special-defense': 'SP.DEF',
            'speed': 'SPD'
        }[s.stat.name] || s.stat.name.toUpperCase();

        const val = s.base_stat;
        const percentage = Math.min(100, (val / 255) * 100); // approximate max

        return `
        <div class="flex items-center text-sm mb-1">
            <span class="w-16 font-mono text-secondary font-bold text-xs">${name}</span>
            <span class="w-8 font-mono font-bold text-right mr-2">${val}</span>
            <div class="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full bg-accent" style="width: ${percentage}%"></div>
            </div>
        </div>
      `;
    }).join('');

    return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity" id="modal-backdrop">
        <div class="bg-surface border border-accent rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-300" id="modal-content">
            <button class="absolute top-4 right-4 text-secondary hover:text-white z-10 p-2" id="close-modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
                <!-- Left Column: Image -->
                <div class="flex flex-col items-center justify-center relative">
                    <div class="font-mono text-secondary/30 text-6xl md:text-8xl font-bold absolute top-0 -z-0 opacity-20 select-none">${formattedId}</div>
                    <img src="${pokemon.sprites.front_default || pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon-art w-48 h-48 md:w-64 md:h-64 object-contain z-10 drop-shadow-2xl">
                    <div class="flex gap-2 mt-4 flex-wrap justify-center">
                        ${typesHtml}
                    </div>
                </div>
                
                <!-- Right Column: Info -->
                <div class="flex flex-col">
                    <h2 class="text-3xl font-bold capitalize mb-1">${pokemon.name}</h2>
                    <p class="text-secondary font-mono text-sm mb-4">${species.genera.find(g => g.language.name === 'en')?.genus || 'Pokémon'}</p>
                    
                    <p class="text-gray-300 text-sm mb-6 leading-relaxed">
                        ${flavorText}
                    </p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-black/30 p-3 rounded-lg text-center border border-border">
                            <div class="text-secondary text-xs uppercase font-bold mb-1">Height</div>
                            <div class="font-mono font-bold">${pokemon.height / 10}m</div>
                        </div>
                        <div class="bg-black/30 p-3 rounded-lg text-center border border-border">
                            <div class="text-secondary text-xs uppercase font-bold mb-1">Weight</div>
                            <div class="font-mono font-bold">${pokemon.weight / 10}kg</div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h4 class="text-sm font-bold text-secondary uppercase mb-2">Base Stats</h4>
                        ${statsHtml}
                    </div>
                    
                    <div>
                        <h4 class="text-sm font-bold text-secondary uppercase mb-1">Abilities</h4>
                        <div class="flex gap-2 flex-wrap">
                            ${pokemon.abilities.map(a => `<span class="text-xs bg-black/50 px-2 py-1 rounded border border-border text-gray-300 capitalize">${a.ability.name.replace('-', ' ')}${a.is_hidden ? ' (Hidden)' : ''}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}
