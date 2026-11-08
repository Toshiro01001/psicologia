# Vistoria de segurança: Clareira Psicologia

Data: 08/11/2026. Site estático de demonstração, publicado no GitHub Pages.

## Resumo

Nenhum dado sai do navegador, nada é guardado, nenhuma dependência externa. O único link para fora é https://mileumalinhas.com.br, no rodapé e na faixa de demonstração.

## Content-Security-Policy

Entregue por `<meta http-equiv="Content-Security-Policy">` em `index.html` e `404.html`:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'
```

- Sem script inline, sem `eval`, sem estilo inline em atributos. O único estilo definido por JavaScript é via CSSOM (`el.style`), que a CSP não bloqueia e que o site não usa em produção (só o teste usa, para a captura).
- `connect-src 'none'` impede qualquer `fetch`, `XMLHttpRequest`, WebSocket ou beacon.
- `form-action 'none'` garante que, mesmo se o JavaScript falhar, o formulário não envia para lugar nenhum.
- `frame-ancestors` não entra porque é ignorada em `meta` (o GitHub Pages não permite cabeçalhos HTTP próprios).
- Em `404.html`, `script-src 'none'`: a página não tem script.

## Envio de dados

- Não existe envio. O formulário de primeiro contato tem `novalidate`, o `submit` é interceptado com `preventDefault()` e o resumo é montado na própria tela com `textContent`.
- Não há e-mail, WhatsApp, telefone clicável nem `mailto:`. Os contatos exibidos são fictícios e em texto puro.
- A agenda é gerada no navegador a partir da data local; não consulta nada.

## O que fica no aparelho

- Nada. Sem `localStorage`, sem `sessionStorage`, sem cookies, sem IndexedDB, sem Service Worker. Ao recarregar, tudo volta ao estado inicial.

## Dependências

- Nenhuma biblioteca JavaScript ou CSS. Nenhum CDN. Fontes locais em `fonts/` (Fraunces e Albert Sans, licença SIL OFL 1.1, com os arquivos de licença).
- Playwright é usado só nos testes locais (`tests/site.cjs`) e não faz parte do site publicado.

## Conteúdo injetado

- Todo texto vindo do visitante (nome, e-mail, telefone, horário, mensagem) entra no DOM por `textContent`, nunca por `innerHTML`. Não há risco de XSS por entrada do visitante.
- Não há parâmetros de URL lidos pelo script.

## Dados reais e segredos

- Psicóloga, CRP, endereço, telefone, valores e horários são inventados. Nenhuma chave, senha ou token em arquivo versionado. A `google20db0e080e71c701.html` é só a verificação pública do Search Console.

## Riscos residuais

- A CSP por `meta` não protege contra injeção que aconteça antes da tag `meta` ser lida; como o HTML é estático e versionado, o risco é só de alteração do repositório em si.
- O `submit` depende de JavaScript para mostrar o resumo. Sem JavaScript, `form-action 'none'` bloqueia o envio e o navegador registra um aviso no console. É o comportamento desejado.
- A página mostra telefones de emergência (CVV 188, SAMU 192) como texto. Se um dia forem trocados por links `tel:`, a CSP continua válida, mas vale revisar o texto de orientação.
