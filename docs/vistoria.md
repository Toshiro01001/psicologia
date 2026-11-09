# Vistoria de segurança: Clareira Psicologia

Data: 08/11/2026 (primeira vistoria e revisão da leva final de design, no mesmo dia). Site estático de demonstração, publicado no GitHub Pages.

## Resumo

Nenhum dado sai do navegador, nada é guardado, nenhuma dependência externa. O único link para fora é https://mileumalinhas.com.br, no rodapé e na faixa de demonstração.

## Content-Security-Policy

Entregue por `<meta http-equiv="Content-Security-Policy">` em `index.html` e `404.html`:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'
```

- Sem script inline, sem `eval`, sem estilo inline em atributos (`style="..."`). O JavaScript só mexe em estilo pelo CSSOM (`el.style`), que a CSP permite, para o atraso de 90 ms entre os blocos que sobem ao rolar. Nenhum valor vem do visitante.
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

## Leva final de design (08/11/2026)

O que mudou e foi conferido nesta leva:

- **CSP continua restritiva e igual**: o `meta` de `index.html` e de `404.html` não mudou. Nada de script ou estilo inline foi adicionado; os ícones novos (etiquetas das seções e asterisco) são SVG escrito no HTML, sem atributo `style` e sem script.
- **Nenhum recurso externo**: as sete fotos estão em `img/` e saem do próprio site (`img-src 'self'`); a chuva e as folhas são desenhadas em `canvas` 2D com código próprio em `js/site.js`, sem biblioteca, sem WebGL, sem fonte nova.
- **Sem `innerHTML` novo**: o resumo da pré-reserva agora é um cartão com dia, horário e modalidade, montado com `createElement` e `textContent`. O bilhete do contato continua igual.
- **Sem dados pessoais**: as fotos foram geradas por IA no Canva e são ilustrativas; a mulher do retrato não é uma pessoa real e nenhuma foto tem texto, placa ou rosto identificável de alguém. Nome, CRP, endereço e valores continuam fictícios.
- **`localStorage`**: não é usado, nem `sessionStorage`, cookies ou IndexedDB. O menu, a agenda e o formulário continuam voltando ao estado inicial quando a página recarrega.
- **Sem rede**: `connect-src 'none'` continua valendo; os laços de animação não fazem requisição nenhuma e param quando a parte sai da tela ou a aba fica oculta.
- **Imagens**: as fotos que estão no site são as definitivas do Canva, convertidas para WebP; nenhuma imagem é de cor lisa ou gerada por script.
- **Testes**: `tests/site.cjs` passou em 1280x900, iPhone 13 e 320px, agora conferindo também se as sete fotos carregam com o tamanho declarado.

## Riscos residuais

- A CSP por `meta` não protege contra injeção que aconteça antes da tag `meta` ser lida; como o HTML é estático e versionado, o risco é só de alteração do repositório em si.
- O `submit` depende de JavaScript para mostrar o resumo. Sem JavaScript, `form-action 'none'` bloqueia o envio e o navegador registra um aviso no console. É o comportamento desejado.
- A página mostra telefones de emergência (CVV 188, SAMU 192) como texto. Se um dia forem trocados por links `tel:`, a CSP continua válida, mas vale revisar o texto de orientação.
