document.addEventListener('DOMContentLoaded', () => {
    const gachaButton = document.getElementById('gacha-button');
    gachaButton.disabled = true; // Nonaktifkan tombol gacha sementara

    fetchPokemonList().then(() => {
        gachaButton.disabled = false; // Aktifkan tombol gacha setelah data selesai dimuat
    });

    populateTypeFilter();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterPokemonList(searchTerm);
    });

    const typeFilter = document.getElementById('type-filter');
    typeFilter.addEventListener('change', () => {
        filterPokemonList(searchInput.value.toLowerCase());
    });

    gachaButton.addEventListener('click', gachaPokemon);

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
});

let allPokemon = [];
let currentPage = 1;
const itemsPerPage = 20;

async function fetchPokemonList() {
    try {
        showLoading();
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        console.log("Pokemon List Data:", data); // Periksa data di console

        // Ambil detail setiap Pokemon
        allPokemon = await Promise.all(
            data.results.map(async (pokemon) => {
                const detail = await fetchPokemonDetail(pokemon.url);
                return {
                    ...pokemon,
                    types: detail.types.map(type => type.type.name),
                    sprites: detail.sprites,
                };
            })
        );

        hideLoading();
        displayPokemonList();
    } catch (error) {
        console.error("Error fetching Pokemon list:", error);
        hideLoading();
        const pokemonListContainer = document.getElementById('pokemon-list');
        pokemonListContainer.innerHTML = '<p>Failed to load Pokemon data. Please try again later.</p>';
    }
}

async function fetchPokemonDetail(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Pokemon Detail Data:", data); // Periksa data di console
        return data;
    } catch (error) {
        console.error("Error fetching Pokemon detail:", error);
        return null;
    }
}

async function displayPokemonList() {
    const pokemonListContainer = document.getElementById('pokemon-list');
    const paginationContainer = document.getElementById('pagination');
    pokemonListContainer.innerHTML = '';
    paginationContainer.innerHTML = '';

    if (allPokemon.length === 0) {
        pokemonListContainer.innerHTML = '<p>No Pokemon data available.</p>';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPokemon = allPokemon.slice(start, end);

    if (paginatedPokemon.length === 0) {
        pokemonListContainer.innerHTML = '<p>No Pokemon found.</p>';
        return;
    }

    for (const pokemon of paginatedPokemon) {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites?.front_default || 'https://via.placeholder.com/100'}" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
        `;

        pokemonCard.addEventListener('click', () => displayPokemonDetail(pokemon));
        pokemonListContainer.appendChild(pokemonCard);
    }

    const totalPages = Math.ceil(allPokemon.length / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            displayPokemonList();
        });
        paginationContainer.appendChild(button);
    }
}

function displayPokemonDetail(pokemon) {
    const pokemonDetailContainer = document.getElementById('pokemon-detail');
    pokemonDetailContainer.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites?.front_default || 'https://via.placeholder.com/100'}" alt="${pokemon.name}">
        <p>Height: ${pokemon.height / 10}m</p>
        <p>Weight: ${pokemon.weight / 10}kg</p>
        <p>Types:</p>
        <ul>
            ${pokemon.types.map(type => `<li>${type}</li>`).join('')}
        </ul>
        <p>Abilities:</p>
        <ul>
            ${pokemon.abilities?.map(ability => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        <p>Stats:</p>
        ${pokemon.stats?.map(stat => `
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${stat.base_stat}%"></div>
            </div>
            <p>${stat.stat.name}: ${stat.base_stat}</p>
        `).join('')}
    `;
}

function filterPokemonList(searchTerm) {
    const typeFilter = document.getElementById('type-filter').value;
    const filteredPokemon = allPokemon.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === '' || pokemon.types.includes(typeFilter);
        return matchesSearch && matchesType;
    });

    const pokemonListContainer = document.getElementById('pokemon-list');
    pokemonListContainer.innerHTML = '';

    if (filteredPokemon.length === 0) {
        pokemonListContainer.innerHTML = '<p>No Pokemon found.</p>';
        return;
    }

    filteredPokemon.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites?.front_default || 'https://via.placeholder.com/100'}" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
        `;

        pokemonCard.addEventListener('click', () => displayPokemonDetail(pokemon));
        pokemonListContainer.appendChild(pokemonCard);
    });
}

async function populateTypeFilter() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data = await response.json();
        console.log("Pokemon Types Data:", data); // Periksa data di console
        const typeFilter = document.getElementById('type-filter');
        data.results.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name;
            typeFilter.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching Pokemon types:", error);
    }
}

async function gachaPokemon() {
    if (allPokemon.length === 0) {
        alert("Pokemon data is still loading. Please wait...");
        return;
    }

    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemon = allPokemon[randomIndex];
    displayPokemonDetail(randomPokemon);
}

function toggleDarkMode() {
    const body = document.body;
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}