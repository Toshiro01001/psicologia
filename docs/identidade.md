# Identidade visual: Clareira Psicologia

Estudo curto feito antes do código. Tudo aqui é fictício: a psicóloga, o consultório, o endereço, o CRP e os horários.

## Nome e posicionamento

**Clareira Psicologia** é o consultório fictício da psicóloga Helena Sodré (CRP 18/00000, número fictício), que atende adultos em Cuiabá e online.

Frase de posicionamento: **"Um lugar para pensar com calma."**

Uma clareira é o espaço aberto no meio da mata onde a luz chega. A marca usa essa ideia o tempo todo: verde fechado em volta, um ponto de luz no centro. Nada de divã, cérebro ou coração desenhado.

## Paleta

| Nome | Hex | Papel |
| --- | --- | --- |
| Névoa | `#EEF1EC` | Fundo principal, claro e um pouco esverdeado. Não é creme nem branco puro. |
| Pinho | `#1B3029` | Texto principal e títulos. |
| Musgo | `#4B6B5E` | Texto secundário, bordas, ícones. Contraste 5,2:1 sobre Névoa. |
| Pedra | `#DCE3DB` | Superfícies: cartões, campos de formulário, faixas de horário. |
| Noite | `#14241F` | Fundo das seções escuras (agenda, rodapé). |
| Sol | `#E3B23C` | Destaque. O ponto de luz da clareira. |

Regras de uso:

- **Sol aparece em um único lugar por tela**: o botão principal da abertura ("Ver horários"), o horário escolhido na agenda, o botão principal do formulário. Nunca em dois elementos ao mesmo tempo na mesma dobra.
- Texto sobre Sol é sempre Pinho (contraste 7,1:1). Sol sobre Noite serve só para texto curto e ícones (contraste 8,2:1). Musgo sobre Pedra fica no limite de 4,5:1, então em cartões Pedra o texto secundário usa Pinho.
- Fundo claro e fundo escuro se alternam por seção para criar ritmo sem precisar de linhas divisórias.
- Sem gradientes, sem sombras decorativas. Profundidade vem da cor da superfície (Pedra sobre Névoa, Pinho sobre Noite).

Fugimos de propósito do lilás-pastel, do creme com terracota e do azul-hospital.

## Tipografia

Duas famílias, ambas locais em `fonts/`, licença SIL OFL 1.1 (arquivos de licença na mesma pasta):

- **Fraunces** (variável, eixos `opsz`, `wght`, `SOFT`, `WONK`): títulos e frases de destaque. Usada com `SOFT` em 100 e `WONK` em 1, o que dá terminais arredondados e um "a" e um "n" com a perna inclinada. É uma serifa com calor humano, longe da serifa editorial fria.
- **Albert Sans** (variável, eixo `wght`, normal e itálico): texto corrido, formulários, botões, legendas. Geométrica, baixa, muito legível em telas pequenas.

Escala (base 17px no corpo, passo próximo de 1,25):

| Papel | Tamanho | Família e peso | Entrelinha |
| --- | --- | --- | --- |
| Título principal | `clamp(2.5rem, 6.5vw, 4.75rem)` | Fraunces 380 | 1,02 |
| Título de seção | `clamp(1.85rem, 3.6vw, 2.75rem)` | Fraunces 400 | 1,1 |
| Subtítulo | `1.3rem` | Fraunces 450 | 1,25 |
| Chamada / lide | `1.2rem` | Albert Sans 400 | 1,5 |
| Corpo | `1.0625rem` (17px) | Albert Sans 400 | 1,6 |
| Legenda | `0.875rem` | Albert Sans 500 | 1,4 |

Regra de peso: títulos nunca passam de 500; ênfase no corpo é 600, nunca negrito pesado; caixa alta só em siglas (CRP, CVV). Nenhum rótulo em caixa alta acima de título.

## Layout

- Contêiner de 1120px com margem lateral de 16px no celular e 32px a partir de 720px.
- Grade de 12 colunas no computador. Na abertura, o texto ocupa 6 colunas e a foto 5; nas demais seções o texto ocupa 7 e o apoio 5. No celular tudo vira uma coluna.
- Ritmo de espaçamento em múltiplos de 8px: 8, 16, 24, 40, 64, 104 (seções).
- Alinhamento à esquerda em tudo, inclusive títulos. Só o aviso de emergência fica centralizado.
- Cantos arredondados em 6px (campos, botões) e 999px (horários, etiquetas). Nenhum cartão com sombra.

## Imagem forte

O início mostra **uma foto de um canto de consultório**, gerada por IA (Canva) e ilustrativa: uma poltrona verde-musgo com uma almofada clara, uma planta grande em vaso de barro, cortina de linho na janela, um quadro de tons verdes, um abajur dourado aceso e uma estante de madeira. A luz é de fim de tarde, quente, e os verdes da cena são os mesmos da paleta (Musgo e Pinho). Não há pessoas. O contêiner tem proporção fixa de 4:3 e cantos de 6 px, como os demais blocos do site. Enquanto a foto carrega, ele mostra a cor média dela.

Nas outras seções a "imagem" é tipográfica: a agenda em grade, o caminho da primeira sessão com uma linha vertical, o resumo do contato como um bilhete. O círculo que respira (anéis em Musgo e um disco Sol) deixou o início e ficou só na página 404.

### Foto do hero

- **Arquivo**: `img/hero.webp`, 1440 x 1080 px, proporção 4:3.
- **Origem**: gerada por IA no Canva. O README e este estudo avisam que é ilustrativa.
- **Prompt resumido**: "Canto de um consultório de psicologia acolhedor: poltrona verde-musgo com almofada de linho, planta grande em vaso de barro, cortina clara na janela, quadro abstrato em tons de verde, abajur de latão aceso, estante de madeira com livros, tapete de fibra natural. Luz quente de fim de tarde, paleta verde, madeira e dourado suave. Estilo editorial de site premium, sem texto, sem pessoas, proporção 4:3."
- **Texto alternativo**: descreve a cena (poltrona, planta, cortina, quadro, abajur e estante).
- **Texto do hero**: fica ao lado da foto no computador e abaixo dela no celular, nunca por cima. O contraste do texto é o da página (Pinho sobre Névoa) e não depende da foto.

## Movimento

- **Um momento orquestrado**: a foto do início surge com um fade de 900 ms assim que a página carrega. Mais nada se move sozinho (o círculo da página 404 respira em CSS).
- **Respostas a ações**: horário escolhido muda de cor em 150ms, passos da primeira sessão deslizam em 200ms, erros do formulário aparecem sem animação.
- Com `prefers-reduced-motion: reduce` a foto aparece sem fade, o círculo da 404 fica parado no tamanho médio e as transições somem.

## Tom de voz

Primeira pessoa (Helena falando), frases curtas, concretas. Acolhimento sem promessa: nunca "cura", "tratamento garantido", "diagnóstico". Em vez disso: "um espaço para", "a gente combina", "você decide o ritmo". O aviso de emergência (CVV 188, SAMU 192, UPA) aparece de forma discreta e permanente, sem alarde.
