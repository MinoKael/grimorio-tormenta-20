const TABELA_CRC = (() => {
    const tabela = new Uint32Array(256);
    for (let indice = 0; indice < 256; indice++) {
        let valor = indice;
        for (let bit = 0; bit < 8; bit++) {
            valor = valor & 1 ? 0xedb88320 ^ (valor >>> 1) : valor >>> 1;
        }
        tabela[indice] = valor >>> 0;
    }
    return tabela;
})();

function calcularCrc(bytes) {
    let crc = 0xffffffff;
    for (let indice = 0; indice < bytes.length; indice++) {
        crc = TABELA_CRC[(crc ^ bytes[indice]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function carimboDos(data) {
    return {
        hora: (data.getHours() << 11) | (data.getMinutes() << 5) | (data.getSeconds() >> 1),
        dia: ((data.getFullYear() - 1980) << 9) | ((data.getMonth() + 1) << 5) | data.getDate(),
    };
}

/**
 * Monta um .zip sem compressão: png e webp já saem comprimidos do canvas,
 * então deflate só custaria tempo. Evita depender de uma biblioteca externa.
 *
 * @param {{nome: string, blob: Blob}[]} arquivos
 * @returns {Promise<Blob>}
 */
export async function criarZip(arquivos) {
    const codificador = new TextEncoder();
    const { hora, dia } = carimboDos(new Date());
    const conteudo = [];
    const diretorio = [];
    let deslocamento = 0;

    for (const arquivo of arquivos) {
        const dados = new Uint8Array(await arquivo.blob.arrayBuffer());
        const nome = codificador.encode(arquivo.nome);
        const crc = calcularCrc(dados);

        const cabecalho = new DataView(new ArrayBuffer(30));
        cabecalho.setUint32(0, 0x04034b50, true);
        cabecalho.setUint16(4, 20, true); // versão mínima
        cabecalho.setUint16(6, 0x0800, true); // nome em utf-8
        cabecalho.setUint16(8, 0, true); // método: armazenado
        cabecalho.setUint16(10, hora, true);
        cabecalho.setUint16(12, dia, true);
        cabecalho.setUint32(14, crc, true);
        cabecalho.setUint32(18, dados.length, true);
        cabecalho.setUint32(22, dados.length, true);
        cabecalho.setUint16(26, nome.length, true);
        conteudo.push(new Uint8Array(cabecalho.buffer), nome, dados);

        const entrada = new DataView(new ArrayBuffer(46));
        entrada.setUint32(0, 0x02014b50, true);
        entrada.setUint16(4, 20, true); // versão de origem
        entrada.setUint16(6, 20, true);
        entrada.setUint16(8, 0x0800, true);
        entrada.setUint16(10, 0, true);
        entrada.setUint16(12, hora, true);
        entrada.setUint16(14, dia, true);
        entrada.setUint32(16, crc, true);
        entrada.setUint32(20, dados.length, true);
        entrada.setUint32(24, dados.length, true);
        entrada.setUint16(28, nome.length, true);
        entrada.setUint32(42, deslocamento, true);
        diretorio.push(new Uint8Array(entrada.buffer), nome);

        deslocamento += 30 + nome.length + dados.length;
    }

    const tamanhoDiretorio = diretorio.reduce((total, parte) => total + parte.length, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true);
    fim.setUint16(8, arquivos.length, true);
    fim.setUint16(10, arquivos.length, true);
    fim.setUint32(12, tamanhoDiretorio, true);
    fim.setUint32(16, deslocamento, true);

    return new Blob([...conteudo, ...diretorio, new Uint8Array(fim.buffer)], { type: 'application/zip' });
}

export function baixarBlob(blob, nome) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
