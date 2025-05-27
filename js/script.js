document.addEventListener("DOMContentLoaded", function () {
  // Carrega os dados do JSON
  fetch('json/produtos.json')
    .then(response => response.json())
    .then(produtos => {
      const container = document.getElementById('cardapio-container');
      container.innerHTML = produtos.map((produto, idx) => `
        <div class="col-md-4">
          <div class="card h-100 shadow card-menu position-relative">
            <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${produto.nome}</h5>
              <p class="card-text">${produto.descricao}</p>
              <p class="fw-bold mb-4" style="color:#000;">${produto.preco}</p>
              <button class="btn btn-danger mt-auto w-100 d-flex align-items-center justify-content-center btn-comprar" data-idx="${idx}">
                <i class="bi bi-cart-fill me-2"></i> Comprar
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Adiciona evento de click para todos os botões "Comprar"
      document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = btn.dataset.idx;
          const produto = produtos[idx];
          const originalHtml = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adicionando...`;
          setTimeout(() => {
            adicionarAoCarrinho(produto);
            btn.innerHTML = `<i class="bi bi-cart-fill me-2"></i> Adicionado!`;
            setTimeout(() => {
              btn.innerHTML = originalHtml;
              btn.disabled = false;
            }, 800);
          }, 1000);
        });
      });
    })
    .catch(() => {
      document.getElementById('cardapio-container').innerHTML = '<p>Não foi possível carregar o cardápio.</p>';
    });

  // Renderiza carrinho ao abrir modal
  const modalCarrinho = document.getElementById('modalCarrinho');
  if (modalCarrinho) {
    modalCarrinho.addEventListener('show.bs.modal', renderizarCarrinho);
  }
});

// Carregar promoções
document.addEventListener("DOMContentLoaded", function () {
  fetch('json/promocoes.json')
    .then(response => response.json())
    .then(promocoes => {
      const promoContainer = document.querySelector('#promo .row');
      promoContainer.innerHTML = promocoes.map(promo => `
        <div class="col-md-6 mb-4">
          <div class="card h-100 border-${promo.cor} border-2 position-relative">
            <div class="card-body text-center p-4">
              ${promo.badge ? `<span class="badge bg-${promo.cor} position-absolute top-0 start-0 m-2">${promo.badge}</span>` : ''}
              <h3 class="text-${promo.cor}">${promo.titulo}</h3>
              <p class="fs-1 fw-bold">${promo.preco}</p>
              <ul class="list-unstyled mb-4">
                ${promo.descricao.map(item => `<li><i class="bi bi-check-lg text-success"></i> ${item}</li>`).join('')}
              </ul>
              ${promo.imagem ? `<img src="${promo.imagem}" alt="${promo.titulo}" class="img-fluid rounded">` : ''}
              <a href="tel:+5511999999999" class="btn btn-${promo.cor} mt-3 w-100">Pedir Promoção</a>
            </div>
          </div>
        </div>
      `).join('');
    });
});

let carrinho = [];

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('carrinho-quantidade');
  const total = carrinho.reduce((sum, item) => sum + item.qtd, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function renderizarCarrinho() {
  const carrinhoItens = document.getElementById('carrinho-itens');
  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = '<p class="text-center text-muted">Seu carrinho está vazio.</p>';
    document.getElementById('carrinho-total').textContent = '';
    return;
  }
  carrinhoItens.innerHTML = carrinho.map((item, idx) => `
    <div class="d-flex align-items-center border-bottom py-2">
      <img src="${item.imagem}" alt="${item.nome}" width="60" class="rounded me-3">
      <div class="flex-grow-1">
        <div class="fw-bold">${item.nome}</div>
        <div class="text-muted">${item.preco}</div>
      </div>
      <div class="input-group input-group-sm me-2" style="width: 90px;">
        <button class="btn btn-outline-secondary btn-menos" data-idx="${idx}" type="button">-</button>
        <input type="text" class="form-control text-center" value="${item.qtd}" readonly>
        <button class="btn btn-outline-secondary btn-mais" data-idx="${idx}" type="button">+</button>
      </div>
      <button class="btn btn-outline-danger btn-sm btn-remover" data-idx="${idx}" title="Remover"><i class="bi bi-trash"></i></button>
    </div>
  `).join('');
  // Total
  const total = carrinho.reduce((sum, item) => {
    const preco = parseFloat(item.preco.replace('R$', '').replace(',', '.'));
    return sum + preco * item.qtd;
  }, 0);
  document.getElementById('carrinho-total').textContent = `Total: R$ ${total.toFixed(2)}`;

  // Eventos dos botões
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.onclick = () => {
      carrinho.splice(btn.dataset.idx, 1);
      atualizarBadgeCarrinho();
      renderizarCarrinho();
    };
  });
  document.querySelectorAll('.btn-mais').forEach(btn => {
    btn.onclick = () => {
      carrinho[btn.dataset.idx].qtd++;
      atualizarBadgeCarrinho();
      renderizarCarrinho();
    };
  });
  document.querySelectorAll('.btn-menos').forEach(btn => {
    btn.onclick = () => {
      if (carrinho[btn.dataset.idx].qtd > 1) {
        carrinho[btn.dataset.idx].qtd--;
      } else {
        carrinho.splice(btn.dataset.idx, 1);
      }
      atualizarBadgeCarrinho();
      renderizarCarrinho();
    };
  });
}

// Adiciona produto ao carrinho
function adicionarAoCarrinho(produto) {
  const idx = carrinho.findIndex(item => item.nome === produto.nome);
  if (idx > -1) {
    carrinho[idx].qtd++;
  } else {
    carrinho.push({ ...produto, qtd: 1 });
  }
  atualizarBadgeCarrinho();
}

document.getElementById('finalizar-pedido').addEventListener('click', function () {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    // Monta a mensagem do pedido
    let mensagem = '*Pedido Delícia Burger*%0A%0A';
    carrinho.forEach(item => {
        mensagem += `🍔 *${item.nome}* x${item.qtd} - ${item.preco}%0A`;
    });
    const total = carrinho.reduce((sum, item) => {
        const preco = parseFloat(item.preco.replace('R$', '').replace(',', '.'));
        return sum + preco * item.qtd;
    }, 0);
    mensagem += `%0A*Total:* R$ ${total.toFixed(2)}%0A`;

    // Forma de pagamento selecionada
    const pagamento = document.querySelector('input[name="pagamento"]:checked');
    if (pagamento) {
        mensagem += `%0A*Pagamento:* ${pagamento.labels[0].innerText}`;
    }

    // Número do WhatsApp da loja (substitua pelo seu número)
    const numero = '5592994906642';
    const url = `https://wa.me/${numero}?text=${mensagem}`;

    window.open(url, '_blank');
});
