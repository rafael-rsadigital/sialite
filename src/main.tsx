import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA (app instalável): só faz sentido nas telas de gestão — quem só está
// respondendo a avaliação (/av/:slug) ou vendo a landing (/) não deve ver
// nenhum prompt/ícone de instalação. Fora dessas rotas, removemos a tag do
// manifest e nem registramos o service worker.
const ROTAS_INSTALAVEIS = ["/acesso", "/admin-rsa", "/dashboard", "/dashboard-gestor"];
const rotaAtual = window.location.pathname;
const permiteInstalacao = ROTAS_INSTALAVEIS.some((rota) => rotaAtual.startsWith(rota));

if (permiteInstalacao) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
  // Garante que uma aba já aberta recarregue sozinha assim que a nova versão
  // do app assumir o controle — evita ficar preso numa versão antiga em cache.
  let recarregando = false;
  navigator.serviceWorker?.addEventListener?.("controllerchange", () => {
    if (recarregando) return;
    recarregando = true;
    window.location.reload();
  });
} else {
  document.querySelector('link[rel="manifest"]')?.remove();
}

createRoot(document.getElementById("root")!).render(<App />);
