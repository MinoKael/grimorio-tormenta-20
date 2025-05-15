async function getData(url, method = 'GET') {
  try {
    const username = import.meta.env.VITE_USERNAME_API;
    const password = import.meta.env.VITE_PASSWORD_API;

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error);
    return null;
  }
}

export { getData }