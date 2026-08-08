/**
 * SudiTuku Global Ad & Affiliate Engine
 * Dikelola secara terpusat untuk seluruh halaman micro-software.
 */
function renderAdBanner() {
  const adContainer = document.getElementById('global-ad-slot');
  if (!adContainer) return;

  adContainer.innerHTML = `
    <div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg my-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/30">
      <div class="space-y-1 text-center sm:text-left">
        <span class="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-indigo-500/30">Global Partner</span>
        <h4 class="font-bold text-lg text-white">Automate Your Workflow with Global AI Tools</h4>
        <p class="text-xs text-slate-300 max-w-xl">Skalakan produktivitas bisnis global Anda hingga 190 negara menggunakan infrastruktur cerdas.</p>
      </div>
      <a href="https://partner-link-anda.com" target="_blank" rel="nofollow sponsored" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all whitespace-nowrap">
        Explore Tool <i class="fa-solid fa-arrow-right ml-1"></i>
      </a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderAdBanner);
