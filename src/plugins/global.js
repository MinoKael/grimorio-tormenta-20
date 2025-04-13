async function getData(url) {
    try {
      const response = await fetch(url);
  
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