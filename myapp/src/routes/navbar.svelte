<script>
    let activeTab = "All Images"; // Default active tab
    let isOpen = true; // Sidebar state (open/closed)

    const tabs = ["All Images", "Favorites", "Categories", "Uploads"];

    function selectTab(tab) {
        activeTab = tab;
    }

    function toggleSidebar() {
        isOpen = !isOpen;
    }
</script>

<button
    class="p-3 bg-gray-800 text-white fixed top-4 left-4 z-50 rounded-md md:hidden"
    on:click={toggleSidebar}
>
    {isOpen ? "Close" : "Open"} Menu
</button>

<nav class="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-gray-800 p-4 text-white shadow-md" id="naver">
    <h1 class="text-2xl font-bold">Pesterin</h1>
    <div class="flex items-center space-x-2">
        <a href="/upload">
            <button class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Upload Image
            </button>
        </a>
        <a href="">
            <button class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Category
            </button>
        </a>
    </div>
</nav>
