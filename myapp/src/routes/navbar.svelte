<script>
    import { onMount } from "svelte";
    import { user, fetchUser, logout } from "../stores/gallery";
    
    let activeTab = "All Images"; // Default active tab
    let isOpen = true; // Sidebar state (open/closed)

    const tabs = ["All Images", "Favorites", "Categories", "Uploads"];

    function selectTab(tab) {
        activeTab = tab;
    }

    function toggleSidebar() {
        isOpen = !isOpen;
    }


    let dropdown = false;

    function toggleDropdown() {
        dropdown = !dropdown;
    }

    onMount(fetchUser);
    console.log("nav", user.name, user.picture, "nav");
</script>

<button 
        class="p-3 bg-gray-800 text-white fixed top-4 left-4 z-50 rounded-md md:hidden"
        on:click={toggleSidebar}
    >
        {isOpen ? "Close" : "Open"} Menu
    </button>
<!-- <nav class="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-gray-800 p-4 text-white shadow-md" id="naver"> -->
    <nav class="flex items-center justify-between bg-gray-800 p-4 text-white">
        <h1 class="text-2xl font-bold">Pesterin</h1>
        <div class="flex items-center space-x-2">
            <a href="/upload">
                <p class="text-white rounded-md hover:underline">Upload Image</p>
            </a>
            <a href="" class="ml-4"> <!-- Added ml-4 for spacing -->
                <button class="text-white rounded-md hover:underline">
                    Category
                </button>
            </a>
            {#if $user}
                <button on:click={toggleDropdown} class="pl-5 ml-4"> <!-- Added ml-4 for spacing -->
                    <img src={$user.picture} alt="Profile" class="profile-pic w-10 inline pr-1 rounded-full" />
                    {$user.name}
                </button>
                {#if dropdown}
                    <div class="dropdown-menu">
                        <a href="">My Uploads</a>
                        <button on:click={logout}>Log Out</button>
                    </div>
                {/if}
            {:else}
                <a href="http://localhost:3000/auth/google" class="ml-4"> <!-- Added ml-4 for spacing -->
                    <button
                        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >Log In</button
                    >
                </a>
            {/if}
        </div>
    </nav>
    