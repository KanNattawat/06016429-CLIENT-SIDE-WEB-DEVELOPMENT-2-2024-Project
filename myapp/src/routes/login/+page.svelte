<script>
  import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import Navbar from "../navbar.svelte";

  let user = null;

  const loginGoogle = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const loginFacebook = () => {
    window.location.href = "http://localhost:3000/auth/facebook";
  };

  const logout = async () => {
    await fetch("http://localhost:3000/logout", { credentials: "include" });
    user = null;
  };
</script>

<Navbar />

<div class="flex items-center justify-center min-h-[calc(100vh-4.72rem)] p-10 bg-gray-900">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
    
    <h2 class="text-3xl font-bold text-gray-800 text-center mb-6">Welcome to <a href="/" class="text-blue-600 hover:text-blue-800">Pesterine!</a></h2>
      <div class="space-y-4">
        <button 
          class="flex items-center justify-center w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg shadow-md"
          on:click={loginGoogle}
        >
          <FontAwesomeIcon icon={faGoogle} class="text-lg mr-3" /> Login with Google
        </button>
        <button 
          class="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md"
          on:click={loginFacebook}
        >
          <FontAwesomeIcon icon={faFacebook} class="text-lg mr-3" /> Login with Facebook
        </button>
      </div>
  </div>
</div>
