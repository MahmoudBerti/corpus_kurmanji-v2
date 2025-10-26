(function() {
    const input = document.getElementById('termInput');
    const autocompleteResults = document.getElementById('autocompleteResults');
    const genreRadios = document.querySelectorAll('input[name="genre"]');
    const searchForm = document.getElementById('searchForm');

    if (!input || !autocompleteResults) {
        console.error('Missing elements for autocomplete');
        return;
    }

    let currentGenre = 'all';
    let timeout = null;
    let activeSuggestionIndex = -1;

    // 🔹 Update genre when user selects a radio button
    genreRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentGenre = this.value;
            if (input.value.length > 1) {
                fetchSuggestions(input.value);
            }
        });
    });

    // 🔹 Input typing listener
    input.addEventListener('input', function() {
        clearTimeout(timeout);
        activeSuggestionIndex = -1;

        if (this.value.length < 2) {
            hideAutocomplete();
            return;
        }

        timeout = setTimeout(() => {
            fetchSuggestions(this.value);
        }, 200);
    });

    // 🔹 Hide autocomplete if user clicks outside
    document.addEventListener('click', function(e) {
        if (!autocompleteResults.contains(e.target) && e.target !== input) {
            hideAutocomplete();
        }
    });

    // 🔹 Keyboard navigation
    input.addEventListener('keydown', function(e) {
        const items = autocompleteResults.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
                updateActiveSuggestion(items);
                break;

            case 'ArrowUp':
                e.preventDefault();
                activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
                updateActiveSuggestion(items);
                break;

            case 'Enter':
                if (activeSuggestionIndex >= 0) {
                    e.preventDefault();
                    input.value = items[activeSuggestionIndex].textContent;
                    hideAutocomplete();
                }
                break;

            case 'Escape':
                hideAutocomplete();
                input.focus();
                break;

            case 'Tab':
                hideAutocomplete();
                break;
        }
    });

    // 🔹 Mouse click selection
    autocompleteResults.addEventListener('click', function(e) {
        if (e.target.classList.contains('autocomplete-item')) {
            input.value = e.target.textContent;
            hideAutocomplete();
            input.focus();
        }
    });

    // 🔹 Highlight the active suggestion
    function updateActiveSuggestion(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeSuggestionIndex);
        });

        if (activeSuggestionIndex >= 0) {
            items[activeSuggestionIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    // 🔹 Fetch suggestions from Flask backend
    function fetchSuggestions(query) {
        if (!query.trim()) {
            hideAutocomplete();
            return;
        }

        fetch(`/autocomplete?q=${encodeURIComponent(query)}&genre=${currentGenre}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error while fetching suggestions');
                }
                return response.json();
            })
            .then(suggestions => {
                if (suggestions && suggestions.length > 0) {
                    showAutocomplete(suggestions);
                } else {
                    hideAutocomplete();
                }
            })
            .catch(error => {
                console.error('Autocomplete error:', error);
                hideAutocomplete();
            });
    }

    // 🔹 Display the autocomplete dropdown
    function showAutocomplete(suggestions) {
        autocompleteResults.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = suggestion;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', 'false');

            if (index === 0) {
                item.classList.add('active');
                activeSuggestionIndex = 0;
            }

            autocompleteResults.appendChild(item);
        });

        autocompleteResults.style.display = 'block';
        autocompleteResults.style.top = `${input.offsetHeight + 5}px`;
    }

    // 🔹 Hide autocomplete
    function hideAutocomplete() {
        autocompleteResults.style.display = 'none';
        autocompleteResults.innerHTML = '';
        activeSuggestionIndex = -1;
    }

    // 🔹 Hide on form submit
    searchForm.addEventListener('submit', function() {
        hideAutocomplete();
    });

    // 🔹 Hide on window resize
    window.addEventListener('resize', function() {
        hideAutocomplete();
    });
})();
