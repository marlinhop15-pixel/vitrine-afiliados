
const produtos = [

  {
    nome: "Fone Bluetooth",
    descricao: "Confira esta oferta especial!",
    preco: "Confira o preço",
    imagem: "",
    loja: "shopee",

    // COLE SEU LINK DE AFILIADO SHOPEE
    link: "COLE_SEU_LINK_SHOPEE_AQUI"
  },

  {
    nome: "Smartwatch",
    descricao: "Uma ótima opção para você!",
    preco: "Confira o preço",
    imagem: "",
    loja: "mercadolivre",

    // COLE SEU LINK DE AFILIADO MERCADO LIVRE
    link: "COLE_SEU_LINK_MERCADO_LIVRE_AQUI"
  }

];

const container = document.getElementById("produtos");

function validarLink(link, loja) {
  try {
    const url = new URL(link);

    if (url.protocol !== "https:") return false;

    const dominio = url.hostname.toLowerCase();

    if (loja === "shopee") {
      return dominio === "shopee.com.br" ||
        dominio.endsWith(".shopee.com.br") ||
        dominio === "shope.ee";
    }

    if (loja === "mercadolivre") {
      return dominio === "mercadolivre.com.br" ||
        dominio.endsWith(".mercadolivre.com.br") ||
        dominio === "meli.la";
    }

    return false;

  } catch {
    return false;
  }
}

function mostrarProdutos(filtro = "todos") {

  container.innerHTML = "";

  const lista = produtos.filter(produto => {
    return filtro === "todos" || produto.loja === filtro;
  });

  lista.forEach(produto => {

    if (!validarLink(produto.link, produto.loja)) {
      return;
    }

    const card = document.createElement("article");
    card.className = "produto";

    if (produto.imagem) {
      const imagem = document.createElement("img");

      imagem.className = "produto-imagem";
      imagem.src = produto.imagem;
      imagem.alt = produto.nome;
      imagem.loading = "lazy";

      imagem.onerror = () => {
        const placeholder = document.createElement("div");
        placeholder.className = "sem-imagem";
        placeholder.textContent = "🛍️";
        imagem.replaceWith(placeholder);
      };

      card.appendChild(imagem);

    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "sem-imagem";
      placeholder.textContent = "🛍️";

      card.appendChild(placeholder);
    }

    const info = document.createElement("div");
    info.className = "produto-info";

    const nome = document.createElement("h3");
    nome.textContent = produto.nome;

    const descricao = document.createElement("p");
    descricao.className = "descricao";
    descricao.textContent = produto.descricao;

    const preco = document.createElement("div");
    preco.className = "preco";
    preco.textContent = produto.preco;

    const botao = document.createElement("a");

    botao.className = "botao " + produto.loja;
    botao.href = produto.link;
    botao.target = "_self";
    botao.rel = "nofollow sponsored";

    botao.textContent =
      produto.loja === "shopee"
        ? "COMPRAR NA SHOPEE"
        : "COMPRAR NO MERCADO LIVRE";

    info.appendChild(nome);
    info.appendChild(descricao);
    info.appendChild(preco);
    info.appendChild(botao);

    card.appendChild(info);

    container.appendChild(card);

  });

  if (container.children.length === 0) {
    container.innerHTML =
      '<div class="mensagem">Nenhum produto cadastrado nesta categoria.</div>';
  }
}

document.querySelectorAll(".filtro").forEach(botao => {

  botao.addEventListener("click", () => {

    document.querySelectorAll(".filtro").forEach(item => {
      item.classList.remove("ativo");
    });

    botao.classList.add("ativo");

    mostrarProdutos(botao.dataset.loja);

  });

});

mostrarProdutos();
    
