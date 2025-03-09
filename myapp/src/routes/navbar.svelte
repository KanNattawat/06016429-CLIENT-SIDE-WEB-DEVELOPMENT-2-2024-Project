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

    function selectTab(tab) {
        activeTab = tab;
    }

    function toggleSidebar() {
        isOpen = !isOpen;
    }

    function toggleMenu() {
        if (menuOpen2) {
            menuOpen2 = !menuOpen2;
        }
        menuOpen = !menuOpen;
        // document.body.style.overflow = menuOpen ? "hidden" : "auto"; // Prevent scrolling when menu is open
    }

    function toggleMenu2() {
        if (menuOpen) {
            menuOpen = !menuOpen;
        }
        menuOpen2 = !menuOpen2;
        // document.body.style.overflow = menuOpen2 ? "hidden" : "auto"; // Prevent scrolling when menu is open
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

<nav
    class="flex items-center justify-between bg-gray-800 p-4 text-white relative"
>
    <h1 class="text-2xl font-bold">Pesterin</h1>
    <div class="flex items-center space-x-2">
        <!-- <a href="/upload">
            <p class="text-white rounded-md hover:underline">Upload Image</p>
        </a> -->
        {#if $user}
            <button
                class="ml-4 text-white rounded-md hover:underline"
                on:click={toggleMenu2}
            >
                Category
            </button>
            <button
                class="ml-4 text-white rounded-md hover:underline"
                on:click={toggleMenu}
            >
                Menu
            </button>
        {/if}
        {#if $user}
            <button id="profile" on:click={toggleDropdown} class="pl-5 ml-4">
                <!-- Added ml-4 for spacing -->
                <img
                    src={$user.picture}
                    alt="Profile"
                    class="profile-pic w-10 inline pr-1 rounded-full"
                />
                {$user.name}
            </button>
            {#if dropdown}
                <div class="dropdown-menu">
                    <a href="">My Uploads</a>
                    <button on:click={logout}>Log Out</button>
                </div>
            {/if}
        {:else}
            <a href="http://localhost:3000/auth/google" class="ml-4">
                <!-- Added ml-4 for spacing -->
                <button
                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >Log In</button
                >
            </a>
        {/if}
    </div>

    {#if menuOpen}
        <div
            class="opacity-100 absolute right-43 top-full w-[8%] bg-gray-700 p-4 flex flex-col space-y-2 shadow-lg overflow-hidden"
        >
            {#each tabs as tab}
                <a class="text-center" href={tab.href}>
                    <button
                        class="text-white hover:underline"
                        on:click={() => selectTab(tab)}>{tab.name}</button
                    >
                </a>
            {/each}
        </div>
    {/if}

    {#if menuOpen2}
        <div
            class="opacity-100 absolute right-60 top-full w-[8%] bg-gray-700 p-4 flex flex-col space-y-2 shadow-lg overflow-hidden"
        >
            {#each categories as tab}
                <a class="text-center" href={tab.href}>
                    <button
                        class="text-white hover:underline"
                        on:click={() => selectTab(tab)}>{tab.name}</button
                    >
                </a>
            {/each}
        </div>
    {/if}
</nav>
