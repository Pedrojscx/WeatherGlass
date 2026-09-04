const campoCidade = document.getElementById("campoCidade");
const areaStatus = document.getElementById("areaStatus");
const URL_CIDADE = "https://brasilapi.com.br/api/cptec/v1/cidade/";
const URL_PREVISAO = "https://brasilapi.com.br/api/cptec/v1/clima/previsao/";

/* Apaga tudo o que estiver dentro da área de status */
function limparAreaStatus() {
  areaStatus.textContent = "";
}

/* Mostra uma mensagem simples */
function mostrarMensagem(texto) {
  limparAreaStatus();
  const paragrafo = document.createElement("p");
  paragrafo.className = "mensagem";
  paragrafo.textContent = texto;
  areaStatus.appendChild(paragrafo);
}

/* Mostra uma mensagem de erro */
function mostrarErro(texto) {
  limparAreaStatus();
  const paragrafo = document.createElement("p");
  paragrafo.className = "mensagem mensagem-erro";
  paragrafo.textContent = texto;
  areaStatus.appendChild(paragrafo);
}

/* Formatação de Data - Sem cair 1 dia a menos se converter para UTC*/
function formatarData(dataDaApi) {
  const partes = dataDaApi.split("-"); // vira ["2026", "08", "28"]
  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];
  return dia + "/" + mes + "/" + ano;
};

/* Aguarda o usuário pressionar ENTER */
campoCidade.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    /* trim() remove os espaços do começo e do fim do texto. */
    const nomeDigitado = campoCidade.value.trim();

    /* Campo vazio: avisamos o usuário e não chamamos a API. */
    if (nomeDigitado === "") {
      mostrarErro("Digite o nome de uma cidade antes de pesquisar.");
      return;
    }

    buscarCidades(nomeDigitado);
  }
});

/* Faz a primeira requisição HTTP: busca as cidades pelo nome. */
async function buscarCidades(nomeDigitado) {
  mostrarMensagem("Buscando...");
  const endereco = URL_CIDADE + encodeURIComponent(nomeDigitado);

  try {
    const resposta = await fetch(endereco);

    /* Quando a API não encontra a cidade, ela responde 404. */
    if (resposta.status === 404) {
      mostrarErro("Nenhuma cidade encontrada.");
      return;
    }

    if (!resposta.ok) {
      mostrarErro(
        "O serviço respondeu com erro " + resposta.status +
        ". O servidor do CPTEC costuma ficar instável, tente novamente em alguns segundos."
      );
      return;
    }

    /* Converte a resposta da API de Json para uma Array*/
    const cidades = await resposta.json();

    /* Caso o campo esteja vazio */
    if (cidades.length === 0) {
      mostrarErro("Nenhuma cidade encontrada.");
      return;
    }

    mostrarListaDeCidades(cidades);

  } catch (erro) {
    /** Caso não seja possível se comunicar com a API */
    mostrarErro(
      "Não foi possível conectar à BrasilAPI. Verifique sua internet e tente novamente."
    );
  }
}

/* Desenha na página a lista de cidades que a API devolveu e transforma as cidades em botões */
function mostrarListaDeCidades(cidades) {
  limparAreaStatus();

  const titulo = document.createElement("h2");
  titulo.className = "titulo-secao";
  titulo.textContent = "Cidades encontradas (" + cidades.length + ") - clique em uma:";
  areaStatus.appendChild(titulo);

  const lista = document.createElement("div");
  lista.className = "lista-cidades";

  /* Percorre o array e cria um botão para cada cidade. */
  for (let i = 0; i < cidades.length; i++) {
    const cidade = cidades[i];

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "item-cidade";

    botao.textContent = cidade.nome + " - " + cidade.estado + " (" + cidade.regiao + ")";

    /* Ao clicar, buscamos a previsão usando o id da cidade. */
    botao.addEventListener("click", function () {
      buscarPrevisao(cidade.id);
    });

    lista.appendChild(botao);
  }

  areaStatus.appendChild(lista);
}

async function buscarPrevisao(idDaCidade) {
  mostrarMensagem("Buscando...");

  const endereco = URL_PREVISAO + encodeURIComponent(idDaCidade);

  try {
    const resposta = await fetch(endereco);

    if (resposta.status === 404) {
      mostrarErro("Não há previsão do tempo disponível para esta cidade.");
      return;
    }

    if (!resposta.ok) {
      mostrarErro(
        "O serviço respondeu com erro " + resposta.status +
        ". O servidor do CPTEC costuma ficar instável, tente novamente em alguns segundos."
      );
      return;
    }

    /* Aqui a resposta é um objeto, não um array. */
    const previsao = await resposta.json();

    mostrarPrevisao(previsao);

  } catch (erro) {
    mostrarErro(
      "Não foi possível conectar à BrasilAPI. Verifique sua internet e tente novamente."
    );
  }
}

/* Desenha na página a previsão do tempo recebida. */
function mostrarPrevisao(previsao) {
  limparAreaStatus();

  const titulo = document.createElement("h2");
  titulo.className = "titulo-secao";
  titulo.textContent = "Previsão para " + previsao.cidade + " - " + previsao.estado;
  areaStatus.appendChild(titulo);

  const atualizado = document.createElement("p");
  atualizado.className = "atualizado-em";
  atualizado.textContent = "Atualizado em: " + formatarData(previsao.atualizado_em);
  areaStatus.appendChild(atualizado);

  const lista = document.createElement("div");
  lista.className = "lista-previsao";

  /* O campo "clima" é um array com um item para cada dia. */
  for (let i = 0; i < previsao.clima.length; i++) {
    const dia = previsao.clima[i];

    const item = document.createElement("div");
    item.className = "item-previsao";

    const dataDoDia = document.createElement("p");
    dataDoDia.className = "data-previsao";
    dataDoDia.textContent = formatarData(dia.data);
    item.appendChild(dataDoDia);

    const condicao = document.createElement("p");
    condicao.className = "linha-dado";
    condicao.textContent = "Condição: " + dia.condicao_desc;
    item.appendChild(condicao);

    const temperaturas = document.createElement("p");
    temperaturas.className = "linha-dado";
    temperaturas.textContent = "Mínima: " + dia.min + "°C / Máxima: " + dia.max + "°C";
    item.appendChild(temperaturas);

    const uv = document.createElement("p");
    uv.className = "linha-dado";
    uv.textContent = "Índice UV: " + dia.indice_uv;
    item.appendChild(uv);

    lista.appendChild(item);
  }

  areaStatus.appendChild(lista);
}
