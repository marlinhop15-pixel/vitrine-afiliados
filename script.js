// ======================================
// CADASTRO DOS PRODUTOS
// ======================================

const produtos = [

  {
    nome: "Fone Bluetooth",
    descricao: "Confira esta oferta especial!",
    preco: "Confira o preço",
    precoAnterior: "",
    imagem: "",
    loja: "shopee",
    categoria: "eletronicos",
    link: "COLE_SEU_LINK_SHOPEE_AQUI"
  },

  {
    nome: "Smartwatch",
    descricao: "Uma ótima opção para você!",
    preco: "Confira o preço",
    precoAnterior: "",
    imagem: "",
    loja: "mercadolivre",
    categoria: "eletronicos",
    link: "COLE_SEU_LINK_MERCADO_LIVRE_AQUI"
  }

];

// ======================================
// ELEMENTOS DA PÁGINA
// ======================================

const container = document.getElementById("produtos");
const pesquisa = document.getElementById("pesquisa");
const contador = document.getElementById("contador");

let lojaSelecionada = "todos";
let categoriaSelecionada = "todos";

// ======================================
// VALIDAÇÃO DOS LINKS
// ======================================

function validarLink(link) {
  try {
    const url = new URL(link);

    // Aceita somente endereços HTTPS.
    // Isso permite links de afiliados encurtados
    // e links de rastreamento das lojas.

    return url.protocol === "https:" &&
      url.hostname.length > 0;

  } catch {
    return false;
  }
}

// ======================================
// CRIAR ELEMENTO DE TEXTO
// ======================================

function criarTexto(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  elemento.textContent = texto || "";

  return elemento;
}

// ======================================
// CRIAR CARD DO PRODUTO
// ======================================

function criarCard(produto) {

  const card = document.createElement("article");
  card.className = "produto";

  // Imagem

  if (
    produto.imagem &&
    validarLink(produto.imagem)
  ) {

    const imagem = document.createElement("img");

    imagem.className = "produto-imagem";
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    imagem.loading = "lazy";

    imagem.onerror = () => {

      const placeholder = criarTexto(
        "div",
        "sem-imagem",
        "🛍️"
      );

      imagem.replaceWith(placeholder);
    };

    card.appendChild(imagem);

  } else {

    card.appendChild(
      criarTexto("div", "sem-imagem", "🛍️")
    );

  }

  // Informações

  const info = document.createElement("div");
  info.className = "produto-info";

  const nomeLoja =
    produto.loja === "shopee"
      ? "SHOPEE"
      : "MERCADO LIVRE";

  const tag = criarTexto(
    "span",
    "loja-tag " + produto.loja,
    nomeLoja
  );

  const nome = criarTexto(
    "h3",
    "",
    produto.nome
  );

  const descricao = criarTexto(
    "p",
    "descricao",
    produto.descricao
  );

  info.appendChild(tag);
  info.appendChild(nome);
  info.appendChild(descricao);

  // Preço anterior, se informado

  if (produto.precoAnterior) {

    info.appendChild(
      criarTexto(
        "div",
        "preco-anterior",
        produto.precoAnterior
      )
    );

  }

  // Preço atual

  info.appendChild(
    criarTexto(
      "div",
      "preco",
      produto.preco
    )
  );

  // Botão de compra

  const botao = document.createElement("a");

  botao.className = "botao " + produto.loja;
  botao.href = produto.link;
  botao.target = "_self";
  botao.rel = "nofollow sponsored";

  botao.textContent =
    produto.loja === "shopee"
      ? "COMPRAR NA SHOPEE"
      : "COMPRAR NO MERCADO LIVRE";

  info.appendChild(botao);

  card.appendChild(info);

  return card;
}

// ======================================
// MOSTRAR PRODUTOS
// ======================================

function mostrarProdutos() {

  container.innerHTML = "";

  const termo = pesquisa.value
    .trim()
    .toLowerCase();

  const lista = produtos.filter(produto => {

    const linkValido = validarLink(produto.link);

    const lojaCorreta =
      lojaSelecionada === "todos" ||
      produto.loja === lojaSelecionada;

    const categoriaCorreta =
      categoriaSelecionada === "todos" ||
      produto.categoria === categoriaSelecionada;

    const textoProduto = (
      produto.nome + " " +
      produto.descricao + " " +
      produto.categoria
    ).toLowerCase();

    const pesquisaCorreta =
      textoProduto.includes(termo);

    return (
      linkValido &&
      lojaCorreta &&
      categoriaCorreta &&
      pesquisaCorreta
    );

  });

  contador.textContent =
    lista.length +
    (lista.length === 1 ? " produto" : " produtos");

  lista.forEach(produto => {

    container.appendChild(
      criarCard(produto)
    );

  });

  if (lista.length === 0) {

    const mensagem = document.createElement("div");

    mensagem.className = "mensagem";

    const titulo = criarTexto(
      "strong",
      "",
      "Nenhum produto encontrado"
    );

    const descricao = criarTexto(
      "p",
      "",
      "Os produtos aparecerão aqui quando forem cadastrados com links válidos de afiliado."
    );

    mensagem.appendChild(titulo);
    mensagem.appendChild(descricao);

    container.appendChild(mensagem);
  }

}

// ======================================
// FILTROS DE LOJA
// ======================================

document.querySelectorAll(".filtro").forEach(botao => {

  botao.addEventListener("click", () => {

    document.querySelectorAll(".filtro").forEach(item => {
      item.classList.remove("ativo");
    });

    botao.classList.add("ativo");

    lojaSelecionada = botao.dataset.loja;

    mostrarProdutos();

  });

});

// ======================================
// FILTROS DE CATEGORIA
// ======================================

document.querySelectorAll(".categoria").forEach(botao => {

  botao.addEventListener("click", () => {

    document.querySelectorAll(".categoria").forEach(item => {
      item.classList.remove("ativo");
    });

    botao.classList.add("ativo");

    categoriaSelecionada = botao.dataset.categoria;

    mostrarProdutos();

  });

});

// ======================================
// PESQUISA
// ======================================

pesquisa.addEventListener("input", mostrarProdutos);

// ======================================
// INICIAR VITRINE
// ======================================

mostrarProdutos();
