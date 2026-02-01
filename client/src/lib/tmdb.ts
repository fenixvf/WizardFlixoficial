// Chave da API obtida das variáveis de ambiente do Replit
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
// URL base da API do TMDB
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Função para buscar dados do TMDB com suporte a localização em português
 * @param endpoint Caminho do recurso (ex: /movie/popular)
 * @param params Parâmetros adicionais da consulta
 */
export async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "pt-BR", // Define o idioma como Português do Brasil
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`Erro na API TMDB: ${response.statusText}`);
  }
  return response.json();
}
