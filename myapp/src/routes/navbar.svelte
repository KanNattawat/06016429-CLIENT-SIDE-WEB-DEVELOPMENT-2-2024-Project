<nav class="navbar">
    <h1>Pesterin</h1>
    <div class="search-box">
        <input type="text" placeholder="Search">
        <button>Search</button>
    </div>
</nav>

<style>
    /* Navbar Styling */
    .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #333;
        padding: 10px 20px;
        color: white;
    }

    .navbar h1 {
        margin: 0;
        font-size: 24px;
    }

    /* Group input & button together */
    .search-box {
        display: flex;
        align-items: center;
    }

    .search-box input {
        padding: 8px;
        border: none;
        border-radius: 5px 0 0 5px;
        outline: none;
    }

    .search-box button {
        padding: 8px 12px;
        border: none;
        background-color: #555;
        color: white;
        border-radius: 0 5px 5px 0;
        cursor: pointer;
    }

    .search-box button:hover {
        background-color: #777;
    }
</style>
