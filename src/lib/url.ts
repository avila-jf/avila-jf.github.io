// Monta links respeitando o "base" do astro.config (hoje o site está na raiz).
// Use url('/sobre') em vez de '/sobre' para o link funcionar nos dois lugares.
export function url(caminho = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
}
