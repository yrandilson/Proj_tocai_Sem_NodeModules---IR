<template>
  <div>
    <!-- Header -->
    <header>
      <nav>
        <div class="logo">
          <div class="logo-icon">T</div>
          <span>TrocaAi</span>
        </div>
        <div class="nav-links">
          <a href="#inicio">Início</a>
          <a href="#como-funciona">Como Funciona</a>
          <a href="#categorias">Categorias</a>
          <router-link to="/login" class="btn btn-secondary">Entrar</router-link>
          <router-link to="/register" class="btn btn-primary">Cadastrar</router-link>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="inicio">
      <div class="hero-content">
        <h1>Bem-vindo ao <span class="hero-highlight">TrocaAi</span></h1>
        <p class="hero-subtitle">Conecte-se com outras pessoas para trocar ou doar itens que você não usa mais. Economia circular e consumo consciente!</p>
      </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
      <form @submit.prevent="handleSearch" class="search-form">
        <input v-model="searchQuery" type="text" placeholder="Buscar por título..." />
        <select v-model="selectedCategory">
          <option value="">Todas as categorias</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button type="submit" class="btn btn-search">Buscar</button>
        <button @click="clearSearch" type="button" class="btn btn-clear">Limpar</button>
      </form>
    </section>

    <!-- Features Section -->
    <section class="features" id="categorias">
      <h2>Por que escolher o TrocaAi?</h2>
      <p class="features-subtitle">A plataforma completa para trocas e doações conscientes</p>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Trocas Inteligentes</h3>
          <p>Sistema de matching que conecta pessoas com interesses compatíveis para trocas justas e equilibradas.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💚</div>
          <h3>Doações Solidárias</h3>
          <p>Doe itens que não usa mais e ajude quem precisa. Faça a diferença na sua comunidade.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌍</div>
          <h3>Sustentabilidade</h3>
          <p>Reduza o desperdício e contribua para um planeta mais sustentável através da economia circular.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Seguro e Confiável</h3>
          <p>Sistema de avaliações e verificação de usuários para garantir transações seguras.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Fácil de Usar</h3>
          <p>Interface intuitiva e simples. Publique seus itens em poucos cliques e comece a trocar.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Comunidade Ativa</h3>
          <p>Junte-se a milhares de usuários que já estão trocando e doando pela plataforma.</p>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works" id="como-funciona">
        <h2>Como Funciona</h2>
        <div class="steps">
            <div class="step">
                <div class="step-number">1</div>
                <h3>Cadastre-se</h3>
                <p>Crie sua conta gratuitamente em menos de 1 minuto</p>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <h3>Publique Itens</h3>
                <p>Adicione fotos e descrições dos itens que quer trocar ou doar</p>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <h3>Conecte-se</h3>
                <p>Encontre pessoas interessadas e negocie as trocas</p>
            </div>
            <div class="step">
                <div class="step-number">4</div>
                <h3>Realize a Troca</h3>
                <p>Combine os detalhes e finalize sua troca com segurança</p>
            </div>
        </div>
    </section>

    <!-- Empty State -->
    <section class="empty-state">
        <svg class="empty-icon" viewBox="0 0 100 100" fill="currentColor">
            <defs>
                <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2ecc71;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#9b59b6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3498db;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z" stroke="url(#boxGradient)" stroke-width="4" fill="none"/>
            <path d="M50,30 L70,40 L70,60 L50,70 L30,60 L30,40 Z" stroke="url(#boxGradient)" stroke-width="3" fill="none"/>
        </svg>
        <h3>Nenhum item encontrado</h3>
        <p style="color: #95a5a6; margin-top: 0.5rem;">Seja o primeiro a publicar um item!</p>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Pronto para começar?</h2>
        <p>Junte-se à comunidade TrocaAi e faça parte da economia circular</p>
        <div class="cta-buttons">
          <router-link to="/register" class="btn btn-primary">Cadastrar Agora</router-link>
          <router-link to="/mapa" class="btn btn-secondary">Explorar Itens</router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <h3>TrocaAi</h3>
          <p>A plataforma que conecta pessoas para trocas e doações conscientes.</p>
        </div>
        <div class="footer-section">
          <h3>Links Rápidos</h3>
          <a href="#inicio">Sobre Nós</a>
          <a href="#como-funciona">Como Funciona</a>
          <a href="#">Termos de Uso</a>
          <a href="#">Política de Privacidade</a>
        </div>
        <div class="footer-section">
            <h3>Categorias</h3>
            <a href="#">Livros</a>
            <a href="#">Eletrônicos</a>
            <a href="#">Roupas</a>
            <a href="#">Móveis</a>
        </div>
        <div class="footer-section">
            <h3>Contato</h3>
            <a href="#">Suporte</a>
            <a href="#">FAQ</a>
            <a href="#">Fale Conosco</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 TrocaAi. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '@/stores/item';

const router = useRouter();
const itemStore = useItemStore();

const searchQuery = ref('');
const selectedCategory = ref('');
const categories = ref<string[]>([]);

onMounted(async () => {
  categories.value = await itemStore.fetchCategories();
});

const handleSearch = () => {
  router.push({ path: '/mapa', query: { search: searchQuery.value, category: selectedCategory.value } });
};

const clearSearch = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
};
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; overflow-x: hidden; }
header { background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); padding: 1.2rem 5%; position: fixed; width: 100%; top: 0; z-index: 1000; box-shadow: 0 2px 30px rgba(155, 89, 182, 0.3); }
nav { display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; }
.logo { display: flex; align-items: center; gap: 12px; font-size: 1.8rem; font-weight: 700; color: white; }
.logo-icon { width: 45px; height: 45px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); color: white; font-weight: bold; box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4); }
.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a { color: white; text-decoration: none; font-weight: 500; transition: all 0.3s; position: relative; }
.nav-links a:hover { opacity: 0.8; transform: translateY(-2px); }
.btn { padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.3s; cursor: pointer; border: none; font-size: 1rem; }
.btn-primary { background: white; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); color: #9b59b6; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(255, 255, 255, 0.4); }
.btn-secondary { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255, 255, 255, 0.5); }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.25); border-color: white; }
.hero { margin-top: 80px; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); padding: 120px 5% 100px; color: white; text-align: center; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 50%, rgba(155, 89, 182, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(52, 152, 219, 0.3) 0%, transparent 50%); animation: pulse 8s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.hero-content { position: relative; z-index: 1; }
.hero h1 { font-size: 4rem; margin-bottom: 1.5rem; font-weight: 800; line-height: 1.2; text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2); }
.hero-highlight { background: linear-gradient(120deg, #2ecc71, #9b59b6, #3498db); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: gradientShift 5s ease infinite; background-size: 200% 200%; }
@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.hero-subtitle { font-size: 1.4rem; margin-bottom: 3rem; opacity: 0.95; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6; }
.search-section { max-width: 900px; margin: -50px auto 0; position: relative; z-index: 10; background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 15px 50px rgba(155, 89, 182, 0.25); border: 1px solid rgba(155, 89, 182, 0.1); }
.search-form { display: grid; grid-template-columns: 1fr auto auto; gap: 1rem; }
.search-form input, .search-form select { padding: 16px 20px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; }
.search-form input:focus, .search-form select:focus { outline: none; border-color: #9b59b6; box-shadow: 0 0 0 4px rgba(155, 89, 182, 0.1); }
.btn-search { background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); color: white; padding: 16px 40px; box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3); }
.btn-search:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(155, 89, 182, 0.4); }
.btn-clear { background: #f5f5f5; color: #666; padding: 16px 30px; }
.btn-clear:hover { background: #e0e0e0; }
.features { padding: 100px 5%; background: linear-gradient(180deg, #ffffff 0%, #f8f4fc 100%); }
.features h2 { text-align: center; font-size: 2.8rem; margin-bottom: 1rem; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.features-subtitle { text-align: center; font-size: 1.2rem; color: #7f8c8d; margin-bottom: 4rem; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; max-width: 1200px; margin: 0 auto; }
.feature-card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 5px 20px rgba(155, 89, 182, 0.1); transition: all 0.3s; border: 1px solid rgba(155, 89, 182, 0.1); }
.feature-card:hover { transform: translateY(-8px); box-shadow: 0 15px 40px rgba(155, 89, 182, 0.2); }
.feature-icon { width: 70px; height: 70px; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.5rem; color: white; box-shadow: 0 8px 20px rgba(155, 89, 182, 0.3); }
.feature-card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #2c3e50; }
.feature-card p { color: #7f8c8d; line-height: 1.7; font-size: 1.05rem; }
.how-it-works { padding: 100px 5%; max-width: 1200px; margin: 0 auto; background: white; }
.how-it-works h2 { text-align: center; font-size: 2.8rem; margin-bottom: 4rem; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; }
.step { text-align: center; position: relative; }
.step-number { width: 70px; height: 70px; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; margin: 0 auto 1.5rem; box-shadow: 0 8px 25px rgba(155, 89, 182, 0.3); transition: transform 0.3s; }
.step:hover .step-number { transform: scale(1.1) rotate(5deg); }
.step h3 { font-size: 1.4rem; margin-bottom: 1rem; color: #2c3e50; }
.step p { color: #7f8c8d; line-height: 1.7; }
.cta { background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); padding: 100px 5%; text-align: center; color: white; position: relative; overflow: hidden; }
.cta::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px; animation: moveGrid 20s linear infinite; }
@keyframes moveGrid { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
.cta-content { position: relative; z-index: 1; }
.cta h2 { font-size: 3rem; margin-bottom: 1.5rem; text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2); }
.cta p { font-size: 1.3rem; margin-bottom: 2.5rem; opacity: 0.95; }
.cta-buttons { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
.cta .btn-primary { font-size: 1.1rem; padding: 18px 45px; background: white; color: #9b59b6; }
.cta .btn-secondary { font-size: 1.1rem; padding: 18px 45px; }
footer { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 60px 5% 30px; }
.footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 2rem; }
.footer-section h3 { margin-bottom: 1.5rem; font-size: 1.3rem; background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.footer-section p, .footer-section a { color: #bdc3c7; line-height: 2; text-decoration: none; display: block; transition: all 0.3s; }
.footer-section a:hover { color: #9b59b6; padding-left: 5px; }
.footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid #34495e; color: #bdc3c7; }
.empty-state { padding: 80px 5%; text-align: center; }
.empty-icon { width: 120px; height: 120px; margin: 0 auto 2rem; opacity: 0.3; }
.empty-state h3 { font-size: 1.8rem; color: #7f8c8d; margin-bottom: 1rem; }
@media (max-width: 768px) {
    .hero h1 { font-size: 2.5rem; }
    .search-form { grid-template-columns: 1fr; }
    .nav-links { gap: 1rem; flex-wrap: wrap; justify-content: center; }
    .features h2, .how-it-works h2, .cta h2 { font-size: 2rem; }
    .cta-buttons { flex-direction: column; align-items: center; }
}
</style>
