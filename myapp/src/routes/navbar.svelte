<script>
    import { onMount } from "svelte";
    import { user, fetchUser, logout } from "../stores/gallery";
    import { get } from "svelte/store";

    let activeTab = "All Images"; // Default active tab
    let isOpen = true; // Sidebar state (open/closed)
    let menuOpen = false; // Menu state (expanded/collapsed)
    let menuOpen2 = false; // Menu state (expanded/collapsed)
    let dropdown = false;

    const tabs = [{ name: "Uploads", href: "/upload" }];

    const categories = [
        { id: 1, name: "All Images", href: "/" },
        { id: 2, name: "Nature", href: "/nature" },
        { id: 3, name: "Animals", href: "/animals" },
        { id: 4, name: "Technology", href: "/technology" },
        { id: 5, name: "Architecture", href: "/architecture" },
        { id: 6, name: "Food", href: "/food" },
    ];

    onMount(fetchUser);

    function selectTab(tab) {
        activeTab = tab;
    }

    function toggleSidebar() {
        isOpen = !isOpen;
    }

    function toggleDropdown() {
        dropdown = !dropdown;
    }

    onMount(fetchUser);
</script>

<button 
        class="p-3 bg-gray-800 text-white fixed top-4 left-4 z-50 rounded-md md:hidden"
        on:click={toggleSidebar}
    >
        {isOpen ? "Close" : "Open"} Menu
    </button>
<!-- <nav class="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-gray-800 p-4 text-white shadow-md" id="naver"> -->
    <nav class="flex items-center justify-between bg-gray-800 p-4 text-white">
        <a href="/"><h1 class="text-3xl font-bold px-5 hover:text-blue-500">Pesterin</h1></a>
        <div class="flex items-center space-x-2">
            <a href="/upload">
                <p class="text-white rounded-md hover:underline">Upload Image</p>
            </a>
            <a href="/" class="ml-4">
                <button class="text-white rounded-md hover:underline">
                    Category
                </button>
            </a>
            {#if $user}
            <div class="relative ml-4">
                <button on:click={toggleDropdown} class="group flex items-center space-x-2 hover:bg-gray-900 py-2 px-4 rounded-xl">
                    <span>{$user ? $user.formatName : "Anonymous"}</span>
                    <img src={$user.picture} alt="Profile" class="w-10 h-10 rounded-full border-2 border-sky-400 group-hover:border-blue-600 group-hover:brightness-75" />
                </button>
                {#if dropdown}
                    <div class="absolute w-full mt-2 bg-white text-black rounded-xl">
                        <a href="/" class="block text-center px-4 py-3 hover:rounded-xl hover:bg-gray-200">My Uploads</a>
                        <button on:click={logout} class="block w-full text-center px-4 py-3 hover:rounded-xl hover:bg-gray-200">Log Out</button>
                    </div>
                {/if}
            </div>
            {:else}
                <a href="http://localhost:3000/auth/google" class="ml-4">
                    <button class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Log In</button>
                </a>
            {/if}
        </div>
    </nav>
    