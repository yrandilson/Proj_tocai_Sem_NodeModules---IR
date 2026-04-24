<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-gray-900 text-gray-300 mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Sobre -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">TrocaAi</h3>
          <p class="text-sm">
            Plataforma de trocas e doações que conecta pessoas através da economia circular e do consumo consciente.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">Links Rápidos</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/" class="hover:text-white transition-colors">Início</RouterLink>
            </li>
            <li>
              <RouterLink to="/login" class="hover:text-white transition-colors">Entrar</RouterLink>
            </li>
            <li>
              <RouterLink to="/register" class="hover:text-white transition-colors">Cadastrar</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Informações -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">Projeto</h3>
          <p class="text-sm mb-2">
            Desenvolvido pela equipe <span class="text-primary-400 font-medium">Dev-Connect</span>
          </p>
          <p class="text-sm">
            Projeto Final - Desenvolvimento Web Fullstack
          </p>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
        <p>&copy; {{ currentYear }} TrocaAi. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
</template>
