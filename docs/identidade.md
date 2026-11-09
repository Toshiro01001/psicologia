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

- **Sol aparece em um único lugar por tela**: o botão principal da abertura ("Ver horários"), o asterisco ao lado de "Como atendo" (que apaga para Névoa assim que um horário é escolhido, porque aí o horário vira o Sol da tela), o horário escolhido na agenda, a borda do passo ativo da primeira sessão, o botão principal do formulário e o ponto do aviso de emergência no rodapé. Nunca em dois elementos ao mesmo tempo na mesma dobra.
- Texto sobre Sol é sempre Pinho (contraste 7,1:1). Sol sobre Noite serve só para texto curto e ícones (contraste 8,2:1). Musgo sobre Pedra fica no limite de 4,5:1, então em cartões Pedra o texto secundário usa Pinho.
- Fundo claro e fundo escuro se alternam por seção para criar ritmo sem precisar de linhas divisórias.
- Sem gradientes, sem sombras decorativas. Profundidade vem da cor da superfície (Pedra sobre Névoa, branco sobre Névoa, Pinho sobre Noite). O brilho verde da abertura é feito de elipses de Musgo quase transparentes empilhadas (ou, sem animação, de um círculo de cor lisa desfocado), não de um gradiente.

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
- Cantos: a página inteira vive numa concha de 28px (40px a partir de 640px); cartões brancos com 24px; botões, busca e pílulas com 999px; campos com 14px; controles sobre Noite (agenda, horários, cartão de papel) com 6px. Nenhum cartão com sombra: só um realce interno de 1px no topo.

## Imagem forte

O início mostra **uma foto de um canto de consultório**, gerada por IA (Canva) e ilustrativa: uma poltrona verde-musgo com uma almofada clara, uma planta grande em vaso de barro, cortina de linho na janela, um quadro de tons verdes, um abajur dourado aceso e uma estante de madeira. A luz é de fim de tarde, quente, e os verdes da cena são os mesmos da paleta (Musgo e Pinho). Não há pessoas. O contêiner tem proporção fixa de 4:3 e cantos de 6 px, como os demais blocos do site. Enquanto a foto carrega, ele mostra a cor média dela.

Na leva final, as outras seções ganharam seis fotos, todas geradas por IA no Canva e ilustrativas, com a mesma luz de fim de tarde e os mesmos verdes: o retrato de perfil da psicóloga em "Quem está do outro lado da conversa", as duas salas (presencial e online) dentro das opções de modalidade, a sala de espera no painel da primeira sessão, a clareira no cerrado ao lado das perguntas e o bloco de notas no bilhete do contato enquanto ele está vazio. A lista com arquivos e tamanhos está no README. O círculo que respira (anéis em Musgo e um disco Sol) continua só na página 404.

### Foto do hero

- **Arquivo**: `img/hero.webp`, 1440 x 1080 px, proporção 4:3.
- **Origem**: gerada por IA no Canva. O README e este estudo avisam que é ilustrativa.
- **Prompt resumido**: "Canto de um consultório de psicologia acolhedor: poltrona verde-musgo com almofada de linho, planta grande em vaso de barro, cortina clara na janela, quadro abstrato em tons de verde, abajur de latão aceso, estante de madeira com livros, tapete de fibra natural. Luz quente de fim de tarde, paleta verde, madeira e dourado suave. Estilo editorial de site premium, sem texto, sem pessoas, proporção 4:3."
- **Texto alternativo**: descreve a cena (poltrona, planta, cortina, quadro, abajur e estante).
- **Texto do hero**: fica ao lado da foto no computador e abaixo dela no celular, nunca por cima. O contraste do texto é o da página (Pinho sobre Névoa) e não depende da foto.

## Movimento

- **Abertura**: a foto surge com um fade de 900 ms; atrás do texto, uma chuva fina em canvas 2D (40 gotas em Pinho a 25%, 20 no celular) cai devagar e respinga na borda de cima da foto, e um brilho Musgo desfocado acompanha o ponteiro até 13px.
- **Ao rolar**: títulos, chamadas, cartões, passos, perguntas, campos e o bilhete sobem 14px com fade em 0,8 s, com 90 ms entre vizinhos. O asterisco de "Como atendo" dá uma volta a cada 9 s enquanto está na tela.
- **Fechamento**: folhas em tons de Musgo e Pinho caem devagar atrás do formulário e do aviso de emergência, só enquanto essa parte está na tela.
- **Respostas a ações**: cartões sobem 4px no hover, o sinal de mais das perguntas gira 45 graus ao abrir, horário escolhido muda de cor em 200ms, passos da primeira sessão deslizam em 200ms, erros do formulário aparecem sem animação.
- Com `prefers-reduced-motion: reduce` a chuva e as folhas nem começam, o brilho fica parado, nada sobe ao rolar, o asterisco fica parado, a foto aparece sem fade, o círculo da 404 fica parado no tamanho médio e as transições somem.

## Tom de voz

Primeira pessoa (Helena falando), frases curtas, concretas. Acolhimento sem promessa: nunca "cura", "tratamento garantido", "diagnóstico". Em vez disso: "um espaço para", "a gente combina", "você decide o ritmo". O aviso de emergência (CVV 188, SAMU 192, UPA) aparece de forma discreta e permanente, sem alarde.

## Design systems aplicados (leva final)

**Dupla:** TerraSprint (claro) + Vesper (escuro), dos design systems do catálogo da Mil e Uma Linhas!. O TerraSprint tem Fraunces leve nos títulos, papel esverdeado com brilho verde e movimento quieto e físico (chuva em canvas, folhas, blocos que sobem devagar): a mesma letra e o mesmo silêncio da Clareira. O Vesper foi feito para saúde mental digital e dá às seções em Noite profundidade sem gradiente nem sombra: barra de vidro, estatísticas com borda esquerda, botão fantasma com hairline e ponto, cartão de papel branco e asterisco que gira devagar.

**Como foram misturados:** as seções em Névoa e Pedra (abertura, quem sou, primeira sessão, perguntas, contato, como funciona) seguem o TerraSprint; as seções em Noite (como atendo e rodapé) seguem o Vesper. O verde floresta do TerraSprint virou Musgo e Pinho; o verde-sinal do Vesper virou Sol, que continua aparecendo em um único elemento por tela. A paleta não mudou: só transparências de Musgo, Névoa, branco e preto foram usadas.

**Componentes:**

| Componente | Origem | Onde está |
| --- | --- | --- |
| Concha de papel (page frame) | TerraSprint | `div.concha` envolvendo a faixa, o topo, o conteúdo e o rodapé, sobre fundo Pedra, raio 28px (40px a partir de 640px) |
| Chão da abertura: chuva em canvas 2D, brilho que segue o ponteiro e fumaça | TerraSprint | `canvas#clareiraParticulas` (chuva e brilho que segue o ponteiro), `div#bloom` (brilho parado quando não há animação) e `div.abre-fumaca` em `section.abre#inicio` |
| Cápsula de navegação | TerraSprint | `header.topo .topo-linha`, Névoa a 78% com desfoque de 18px, mais fosca depois de 40px; no celular, botão redondo e folha de raio 28px |
| Etiqueta de seção em pílula | TerraSprint | `p.olho` acima dos títulos de quem sou, primeira sessão, perguntas, contato e como funciona |
| Cartão de serviço branco r24 | TerraSprint | `.lista-bloco`, `button.passo`, `.passo-painel`, `details.faq-item` (sem a sombra longa) |
| Faixa de prova em três pílulas | TerraSprint | `div.prova` entre quem sou e como atendo; inclinam e se sobrepõem a partir de 1024px |
| Revelação por subida | TerraSprint | `[data-rise]` em títulos, chamadas, cartões, passos, perguntas, campos e bilhete |
| Chão do fechamento: folhas em canvas 2D | TerraSprint | `canvas#petalas` em `div.fechamento` (contato e emergência) |
| Barra de vidro | Vesper | `fieldset.modalidade` e `div.agenda-topo` |
| Estatística com borda esquerda | Vesper | `dl.agenda-dados` ao lado do título "Como atendo" |
| Botão fantasma com ponto de 2px | Vesper | `.botao-escuro`, `.botao-claro[data-levar]` e `.horario` sobre Noite |
| Cartão de papel | Vesper | `.agenda-resumo-texto` (pré-reserva) e `aside.bilhete` |
| Asterisco que gira e sinal de mais que gira 45 graus | Vesper | `svg.asterisco` em `h2#titulo-atend` e o marcador das perguntas |
| Rodapé em colunas | Vesper | `footer.rodape .rodape-grade`: Clareira e CRP, seções do site, emergência |

**Escolhas que diferem do plano, para respeitar esta identidade:** a cápsula do topo fica mais fosca ao rolar mas não ganha sombra; as folhas do fechamento usam Musgo e Pinho em vez de Sol (o botão "Conferir e ver resumo" já é o Sol daquela tela); o asterisco é Sol só até um horário ser escolhido; a sala de espera é a mesma foto nos cinco momentos da primeira sessão (o plano previa uma foto por momento, mas só a do momento 1 foi gerada); no celular a foto da clareira usa recorte 4:3 em vez de 4:5, para a busca não ficar longe do título.
