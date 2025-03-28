// Global variables
let currentPage = 1;
const limit = 10;
let totalPages = null;
let isFetching = false;
let booksData = [];
let currentView = 'grid'; // grid and list

const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const toggleViewBtn = document.getElementById('toggleView');

// Get API URL with paramenters
const getApiUrl = () => {
    return `https://api.freeapi.app/api/v1/public/books?page=${currentPage}&limit=${limit}&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=tech`;
};

// Fetch books from API
const fetchBooks = () => {
    if (isFetching) return;
    // If reached total pages stop fetching
    if (totalPages && currentPage > totalPages) return;

    isFetching = true;
    fetch(getApiUrl())
        .then(response => response.json())
        .then(data => {
            const newBooks = data.data.data || [];
            booksData = booksData.concat(newBooks);
            totalPages = data.data.totalPages;
            renderBooks();
            // If there's a next page, increment currentPage for future calls
            if (data.data.nextPage) {
                currentPage++;
            }
            isFetching = false;
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            isFetching = false;
        });
};

// Render bookss based on search & sort
const renderBooks = () => {
    // Get search query and sort option
    const query = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    // Filter books on title & author
    let filteredBooks = booksData.filter(book => {
        const volume = book.volumeInfo || {};
        const title = (volume.title || "").toLowerCase();
        const authors = volume.authors ? volume.authors.join(', ').toLowerCase() : "";
        return title.includes(query) || authors.includes(query);
    });

    // sorting
    if (sortBy === 'title') {
        filteredBooks.sort((a, b) => {
            const titleA = (a.volumeInfo && a.volumeInfo.title) || '';
            const titleB = (b.volumeInfo && b.volumeInfo.title) || '';
            return titleA.localeCompare(titleB);
        });
    } else if (sortBy === 'publishedDate') {
        filteredBooks.sort((a, b) => {
            const dateA = new Date((a.volumeInfo && a.volumeInfo.publishedDate) || 0);
            const dateB = new Date((b.volumeInfo && b.volumeInfo.publishedDate) || 0);
            return dateA - dateB;
        });
    }

    // Clear container and add book items
    booksContainer.innerHTML = '';
    filteredBooks.forEach(book => {
        const volume = book.volumeInfo || {};
        const item = document.createElement('div');
        item.className = 'book-item';
        // add book link
        item.addEventListener('click', () => {
            if (volume.infoLink) {
                window.open(volume.infoLink, '_blank');
            }
        });

        // Create thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.className = 'book-thumbnail';
        thumbnail.src = (volume.imageLinks && volume.imageLinks.thumbnail) || 'https://via.placeholder.com/200x300?text=No+Image';

        // Create book
        const details = document.createElement('div');
        details.className = 'book-details';
        details.innerHTML = `
       <h3>${volume.title || 'No Title'}</h3>
       <p><strong>Author:</strong> ${(volume.authors && volume.authors.join(', ')) || 'Unknown'}</p>
       <p><strong>Publisher:</strong> ${volume.publisher || 'Unknown'}</p>
       <p><strong>Published:</strong> ${volume.publishedDate || 'N/A'}</p>
     `;

        // Append book details
        item.appendChild(thumbnail);
        item.appendChild(details);
        booksContainer.appendChild(item);
    });
};

// Toggle between grid and list view
toggleViewBtn.addEventListener('click', () => {
    if (currentView === 'grid') {
        currentView = 'list';
        booksContainer.classList.remove('grid-view');
        booksContainer.classList.add('list-view');
    } else {
        currentView = 'grid';
        booksContainer.classList.remove('list-view');
        booksContainer.classList.add('grid-view');
    }
});

// search input changes
searchInput.addEventListener('input', renderBooks);

// sort changes
sortSelect.addEventListener('change', renderBooks);

// infinite scrolling (pagination)
window.addEventListener('scroll', () => {
    // If the user has scrolled near the bottom and not already fetching, fetch the next page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isFetching) {
        fetchBooks();
    }
});


fetchBooks();