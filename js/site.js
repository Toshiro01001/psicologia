/* Clareira Psicologia: comportamento da página.
   Tudo roda no navegador. Nenhum dado sai daqui, nada é guardado. */
(function () {
  "use strict";

  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };
  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu no celular ---------- */
  var menuBotao = $(".menu-botao");
  var menu = $("#menu");
  if (menuBotao && menu) {
    var fechaMenu = function () {
      menu.classList.remove("aberto");
      menuBotao.setAttribute("aria-expanded", "false");
      menuBotao.setAttribute("aria-label", "Abrir menu");
    };
    menuBotao.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      menuBotao.setAttribute("aria-expanded", aberto ? "true" : "false");
      menuBotao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", fechaMenu); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && menu.classList.contains("aberto")) { fechaMenu(); menuBotao.focus(); }
    });
  }

  /* ---------- Cápsula do topo: mais fosca depois de 40px de rolagem ---------- */
  var topo = $(".topo");
  if (topo) {
    var marcaRolagem = function () { topo.classList.toggle("rolou", window.scrollY > 40); };
    window.addEventListener("scroll", marcaRolagem, { passive: true });
    marcaRolagem();
  }

  /* ---------- Modalidade + agenda simulada ---------- */
  var DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  var DIAS_LONGO = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var HORAS_BASE = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
  var HORAS_ONLINE = ["18:00", "19:00"];

  var estado = { modalidade: "presencial", semana: 0, dia: null, horario: null };

  var zeraHora = function (d) { var c = new Date(d); c.setHours(0, 0, 0, 0); return c; };
  var hoje = zeraHora(new Date());
  var indiceDia = function (d) { return Math.floor(zeraHora(d).getTime() / 86400000); };

  // Semente determinística: o mesmo dia sempre mostra os mesmos horários.
  var sorteio = function (semente) {
    var x = Math.sin(semente * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  var horariosDoDia = function (data, modalidade) {
    var base = modalidade === "online" ? HORAS_BASE.concat(HORAS_ONLINE) : HORAS_BASE;
    var idx = indiceDia(data);
    var lista = base.filter(function (h, i) { return sorteio(idx * 31 + i * 7) > 0.42; });
    if (lista.length === 0) lista = [base[idx % base.length]];
    if (zeraHora(data).getTime() === hoje.getTime()) {
      var agoraH = new Date().getHours();
      lista = lista.filter(function (h) { return parseInt(h, 10) > agoraH + 1; });
    }
    return lista;
  };

  var segundaDaSemana = function (offset) {
    var d = new Date(hoje);
    var dow = d.getDay();
    var paraSegunda = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + paraSegunda);
    if (dow === 0 || dow === 6) d.setDate(d.getDate() + 7);
    d.setDate(d.getDate() + offset * 7);
    return d;
  };

  var fmtCurta = function (d) { return d.getDate() + " " + MESES[d.getMonth()]; };
  var fmtLonga = function (d) { return DIAS_LONGO[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()] + "."; };

  var agenda = $("[data-agenda]");
  if (agenda) {
    var diasEl = $("[data-dias]", agenda);
    var horariosEl = $("[data-horarios]", agenda);
    var diaTexto = $("[data-dia-texto]", agenda);
    var periodoEl = $("[data-periodo]", agenda);
    var resumoEl = $("[data-resumo]", agenda);
    var resumoTexto = $("[data-resumo-texto]", agenda);
    var botAnt = $('[data-semana="-1"]', agenda);
    var levar = $("[data-levar]", agenda);

    // Resumo como cartão de papel: dia, horário e modalidade separados por linhas finas.
    var montaResumo = function (h) {
      resumoTexto.textContent = "";
      var rot = document.createElement("span");
      rot.className = "resumo-rotulo";
      rot.textContent = "Pré-reserva simulada";
      var dl = document.createElement("dl");
      dl.className = "resumo-linhas";
      [["Dia", DIAS_LONGO[estado.dia.getDay()] + ", " + fmtCurta(estado.dia)],
       ["Horário", "às " + h],
       ["Modalidade", estado.modalidade === "online" ? "online" : "presencial"]].forEach(function (par) {
        var grupo = document.createElement("div");
        var dt = document.createElement("dt"); dt.textContent = par[0];
        var dd = document.createElement("dd"); dd.textContent = par[1];
        grupo.appendChild(dt); grupo.appendChild(dd); dl.appendChild(grupo);
      });
      var nota = document.createElement("span");
      nota.className = "resumo-nota";
      nota.textContent = "Nada foi reservado de verdade.";
      resumoTexto.appendChild(rot); resumoTexto.appendChild(dl); resumoTexto.appendChild(nota);
    };

    var limpaEscolha = function () {
      estado.dia = null; estado.horario = null;
      horariosEl.textContent = "";
      diaTexto.textContent = "Escolha um dia acima para ver os horários.";
      resumoEl.hidden = true;
    };

    var desenhaHorarios = function () {
      horariosEl.textContent = "";
      resumoEl.hidden = true;
      estado.horario = null;
      var lista = horariosDoDia(estado.dia, estado.modalidade);
      diaTexto.textContent = fmtLonga(estado.dia) + " " + (estado.modalidade === "online" ? "Online." : "No consultório.");
      if (lista.length === 0) {
        var vazio = document.createElement("p");
        vazio.className = "horarios-vazio";
        vazio.textContent = "Sem horários neste dia. Tente o próximo.";
        horariosEl.appendChild(vazio);
        return;
      }
      lista.forEach(function (h) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "horario";
        b.textContent = h;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          $$(".horario", horariosEl).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          estado.horario = h;
          montaResumo(h);
          resumoEl.hidden = false;
        });
        horariosEl.appendChild(b);
      });
    };

    var desenhaDias = function () {
      diasEl.textContent = "";
      var seg = segundaDaSemana(estado.semana);
      var sex = new Date(seg); sex.setDate(seg.getDate() + 4);
      periodoEl.textContent = fmtCurta(seg) + " a " + fmtCurta(sex);
      botAnt.disabled = estado.semana === 0;
      for (var i = 0; i < 5; i++) {
        (function () {
          var d = new Date(seg); d.setDate(seg.getDate() + i);
          var passado = d.getTime() < hoje.getTime();
          var vagas = passado ? 0 : horariosDoDia(d, estado.modalidade).length;
          var b = document.createElement("button");
          b.type = "button";
          b.className = "dia";
          b.setAttribute("aria-pressed", estado.dia && estado.dia.getTime() === d.getTime() ? "true" : "false");
          b.setAttribute("aria-label", DIAS_LONGO[d.getDay()] + ", " + fmtCurta(d) + (passado ? ", já passou" : ", " + vagas + (vagas === 1 ? " horário" : " horários")));
          b.disabled = passado || vagas === 0;
          var s1 = document.createElement("span"); s1.className = "dia-semana"; s1.textContent = DIAS_SEMANA[d.getDay()];
          var s2 = document.createElement("span"); s2.className = "dia-num"; s2.textContent = d.getDate();
          var s3 = document.createElement("span"); s3.className = "dia-vagas"; s3.textContent = passado ? "passou" : vagas + (vagas === 1 ? " vaga" : " vagas");
          b.appendChild(s1); b.appendChild(s2); b.appendChild(s3);
          b.addEventListener("click", function () {
            estado.dia = d;
            $$(".dia", diasEl).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
            b.setAttribute("aria-pressed", "true");
            desenhaHorarios();
          });
          diasEl.appendChild(b);
        })();
      }
    };

    $$("[data-semana]", agenda).forEach(function (b) {
      b.addEventListener("click", function () {
        var prox = estado.semana + parseInt(b.getAttribute("data-semana"), 10);
        if (prox < 0 || prox > 3) return;
        estado.semana = prox;
        limpaEscolha();
        desenhaDias();
      });
    });

    $$('input[name="modalidade"]').forEach(function (r) {
      r.addEventListener("change", function () {
        if (!r.checked) return;
        estado.modalidade = r.value;
        var selForm = $("#f-modalidade");
        if (selForm) selForm.value = r.value;
        desenhaDias();
        if (estado.dia) desenhaHorarios(); else limpaEscolha();
      });
    });

    if (levar) {
      levar.addEventListener("click", function () {
        var selForm = $("#f-modalidade");
        var hor = $("#f-horario");
        if (selForm) selForm.value = estado.modalidade;
        if (hor && estado.dia && estado.horario) {
          hor.value = DIAS_LONGO[estado.dia.getDay()] + ", " + fmtCurta(estado.dia) + ", às " + estado.horario;
        }
      });
    }

    desenhaDias();
  }

  /* ---------- Primeira sessão em passos ---------- */
  var PASSOS = [
    { t: "Você chega, ou entra na chamada", d: "Chegue uns minutos antes. No consultório, a sala de espera é só sua naquele horário; online, eu envio o link no dia. Não precisa preparar nada nem trazer documento. Água e lenço ficam na mesa." },
    { t: "A gente combina as regras", d: "Nos primeiros minutos eu explico o sigilo, a duração de 50 minutos, o valor, a forma de pagamento e como funcionam faltas e remarcações. Você pergunta o que quiser. Esse combinado é o chão de tudo o que vem depois." },
    { t: "Você conta o que trouxe você aqui", d: "Não existe jeito certo de começar. Pode ser um fato, uma sensação, uma frase solta. Eu escuto sem interromper e sem julgar. Se travar, tudo bem: o silêncio também faz parte." },
    { t: "Eu faço perguntas, sem pressa", d: "Pergunto sobre o momento atual, sobre o que já tentou, sobre sono, trabalho, relações e o que mais parecer importante. Nada é obrigatório responder. A ideia é começarmos a entender juntos o que está acontecendo, não fechar um diagnóstico." },
    { t: "Decidimos juntos como seguir", d: "No fim, eu digo o que percebi e proponho um ritmo. Você decide se quer continuar, se prefere pensar, ou se faz mais sentido outro tipo de ajuda. Não há compromisso de continuidade por ter vindo uma vez." }
  ];
  var painel = $("[data-passo-painel]");
  if (painel) {
    var botoesPasso = $$("[data-passo]");
    var etiqueta = $("[data-passo-etiqueta]");
    var tituloP = $("[data-passo-titulo]");
    var textoP = $("[data-passo-texto]");
    var ant = $("[data-passo-ant]");
    var prox = $("[data-passo-prox]");
    var atual = 0;

    var mostraPasso = function (i, foco) {
      atual = Math.max(0, Math.min(PASSOS.length - 1, i));
      botoesPasso.forEach(function (b, k) {
        var ativo = k === atual;
        b.classList.toggle("ativo", ativo);
        if (ativo) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      etiqueta.textContent = "Momento " + (atual + 1) + " de " + PASSOS.length;
      tituloP.textContent = PASSOS[atual].t;
      textoP.textContent = PASSOS[atual].d;
      ant.disabled = atual === 0;
      prox.disabled = atual === PASSOS.length - 1;
      painel.classList.remove("troca");
      void painel.offsetWidth;
      painel.classList.add("troca");
      if (foco) tituloP.setAttribute("tabindex", "-1");
    };
    botoesPasso.forEach(function (b) {
      b.addEventListener("click", function () { mostraPasso(parseInt(b.getAttribute("data-passo"), 10)); });
    });
    ant.addEventListener("click", function () { mostraPasso(atual - 1); });
    prox.addEventListener("click", function () { mostraPasso(atual + 1); });
    mostraPasso(0);
  }

  /* ---------- Perguntas com busca ---------- */
  var normaliza = function (s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  };
  var busca = $("[data-busca]");
  if (busca) {
    var itens = $$("[data-faq-item]");
    var conta = $("[data-busca-conta]");
    var vazioFaq = $("[data-faq-vazio]");
    var filtra = function () {
      var termo = normaliza(busca.value.trim());
      var visiveis = 0;
      itens.forEach(function (it) {
        var bate = termo === "" || normaliza(it.textContent).indexOf(termo) !== -1;
        it.hidden = !bate;
        if (bate) visiveis++;
        if (bate && termo !== "" && termo.length >= 3) it.open = true;
        if (termo === "") it.open = false;
      });
      conta.textContent = termo === "" ? itens.length + " perguntas" : visiveis + (visiveis === 1 ? " pergunta encontrada" : " perguntas encontradas");
      vazioFaq.hidden = visiveis !== 0;
    };
    busca.addEventListener("input", filtra);
  }

  /* ---------- Formulário de primeiro contato ---------- */
  var form = $("[data-form]");
  if (form) {
    var aviso = $("[data-form-aviso]", form);
    var contaMsg = $("[data-conta]", form);
    var msg = $("#f-msg");
    var bilheteVazio = $("[data-bilhete-vazio]");
    var bilheteConteudo = $("[data-bilhete-conteudo]");
    var bilheteLista = $("[data-bilhete-lista]");

    msg.addEventListener("input", function () {
      contaMsg.textContent = msg.value.length + " de 600 caracteres";
    });

    var poeErro = function (id, texto) {
      var campo = $("#f-" + id);
      var erro = $("#e-" + id);
      if (erro) erro.textContent = texto;
      if (campo) {
        if (texto) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid");
      }
      return !texto;
    };

    var validaNome = function (v) {
      v = v.trim();
      if (!v) return "Escreva seu nome.";
      if (v.length < 2) return "Nome muito curto.";
      if (!/\s/.test(v)) return "Escreva nome e sobrenome.";
      return "";
    };
    var validaEmail = function (v) {
      v = v.trim();
      if (!v) return "Escreva um e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Esse e-mail não parece completo. Ex.: nome@dominio.com.br";
      return "";
    };
    var validaFone = function (v) {
      var dig = v.replace(/\D/g, "");
      if (!dig) return "";
      if (dig.length < 10 || dig.length > 11) return "Telefone com DDD tem 10 ou 11 números.";
      return "";
    };
    var validaModalidade = function (v) { return v ? "" : "Escolha presencial ou online."; };
    var validaCiente = function (ok) { return ok ? "" : "Marque a caixa para seguir."; };

    var formataFone = function (v) {
      var d = v.replace(/\D/g, "");
      if (d.length === 11) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
      if (d.length === 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
      return v;
    };

    var linha = function (rotulo, valor) {
      var dt = document.createElement("dt"); dt.textContent = rotulo;
      var dd = document.createElement("dd"); dd.textContent = valor;
      bilheteLista.appendChild(dt); bilheteLista.appendChild(dd);
    };

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = $("#f-nome").value, email = $("#f-email").value, fone = $("#f-fone").value;
      var modal = $("#f-modalidade").value, hor = $("#f-horario").value.trim(), texto = msg.value.trim();
      var ciente = $("#f-ciente").checked;

      var ok = true;
      ok = poeErro("nome", validaNome(nome)) && ok;
      ok = poeErro("email", validaEmail(email)) && ok;
      ok = poeErro("fone", validaFone(fone)) && ok;
      ok = poeErro("modalidade", validaModalidade(modal)) && ok;
      ok = poeErro("ciente", validaCiente(ciente)) && ok;

      if (!ok) {
        aviso.classList.remove("ok");
        aviso.textContent = "Confira os campos marcados.";
        var primeiro = $('[aria-invalid="true"]', form) || $("#f-ciente");
        if (primeiro) primeiro.focus();
        return;
      }

      bilheteLista.textContent = "";
      linha("Nome", nome.trim());
      linha("E-mail", email.trim());
      if (fone.replace(/\D/g, "")) linha("Telefone", formataFone(fone));
      linha("Modalidade", modal === "online" ? "Online, por vídeo" : "Presencial, em Cuiabá");
      linha("Horário preferido", hor || "A combinar");
      if (texto) linha("Mensagem", texto);
      linha("Conferido em", new Date().toLocaleString("pt-BR"));
      bilheteVazio.hidden = true;
      bilheteConteudo.hidden = false;
      aviso.classList.add("ok");
      aviso.textContent = "Tudo certo. O resumo está ao lado (ou logo abaixo, no celular). Nada foi enviado.";
      if (window.innerWidth < 900) {
        bilheteConteudo.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "start" });
      }
    });

    form.addEventListener("reset", function () {
      ["nome", "email", "fone", "modalidade", "horario", "msg", "ciente"].forEach(function (id) { poeErro(id, ""); });
      aviso.textContent = "";
      aviso.classList.remove("ok");
      contaMsg.textContent = "0 de 600 caracteres";
      bilheteLista.textContent = "";
      bilheteConteudo.hidden = true;
      bilheteVazio.hidden = false;
    });
  }
  /* ---------- Movimento (TerraSprint + Vesper), tudo desligado com prefers-reduced-motion ---------- */
  var temIO = "IntersectionObserver" in window;

  // Enquanto visível: liga e desliga um laço de animação conforme a parte entra ou sai da tela.
  var quandoVisivel = function (alvo, liga, desliga) {
    if (!temIO) { liga(); return; } // sem IntersectionObserver: roda sempre
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) liga(); else desliga(); });
    }, { threshold: 0 }).observe(alvo);
  };

  // Canvas com nitidez em telas de alta densidade (no máximo 2x) que acompanha o tamanho da seção.
  var preparaCanvas = function (canvas, caixa, aoMedir) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mede = function () {
      var r = caixa.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (aoMedir) aoMedir(r.width, r.height);
    };
    mede();
    if ("ResizeObserver" in window) new ResizeObserver(mede).observe(caixa);
    else window.addEventListener("resize", mede);
    return ctx;
  };

  var celular = window.matchMedia("(max-width: 767px)").matches;

  if (!reduzMovimento) {
    /* Revelação por subida: 14px, .8s, 90ms entre irmãos, ao entrar 12% na tela */
    var rises = $$("[data-rise]");
    if (temIO && rises.length) {
      document.documentElement.classList.add("sobe");
      var ioRise = new IntersectionObserver(function (entradas) {
        var n = 0;
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.style.transitionDelay = Math.min(n, 6) * 90 + "ms";
          n++;
          el.classList.add("subiu");
          ioRise.unobserve(el);
          setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
        });
      }, { threshold: 0.12 });
      rises.forEach(function (el) { ioRise.observe(el); });
    }

    /* Asterisco do "Como atendo": gira só enquanto visível */
    var asterisco = $(".asterisco");
    if (asterisco) {
      quandoVisivel(asterisco, function () { asterisco.classList.add("visivel"); }, function () { asterisco.classList.remove("visivel"); });
    }

    /* Abertura: chuva fina em canvas 2D, respingando na borda da foto, com o brilho Musgo
       que segue o ponteiro (até 13px) desenhado no mesmo canvas. O brilho vira uma imagem pronta
       uma vez só e depois é só copiado a cada quadro: bem mais leve que um filtro de desfoque em CSS. */
    var abre = $(".abre");
    var chuva = $("#clareiraParticulas");
    var ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (abre && chuva && chuva.getContext) {
      document.documentElement.classList.add("chuva-ligada"); // o brilho em CSS (fallback) sai de cena
      var foto = $(".abre-foto", abre);
      var titulo = $("#titulo-abre");
      var L = 0, A = 0, vento = 0, rodando = false, quadro = 0;
      var gotas = [], respingos = [];
      var TOTAL = celular ? 20 : 40;
      var brilho = document.createElement("canvas");
      var desenhaBrilho = function () {
        var bw = Math.round(Math.min(560, Math.max(260, L * 0.7))), bh = Math.round(bw * 0.72);
        brilho.width = bw; brilho.height = bh;
        var cb = brilho.getContext("2d");
        cb.fillStyle = "rgba(75, 107, 94, 0.005)"; // Musgo: 40 elipses empilhadas somam cerca de 18% no centro
        for (var k = 0; k < 40; k++) {
          var f = 1 - k / 42;
          cb.beginPath();
          cb.ellipse(bw / 2, bh / 2, (bw / 2) * f, (bh / 2) * f, 0, 0, Math.PI * 2);
          cb.fill();
        }
      };
      var ctxC = preparaCanvas(chuva, chuva, function (l, a) { L = l; A = a; desenhaBrilho(); });
      var novaGota = function (topo) {
        return { x: Math.random() * (L + 80) - 40, y: topo ? -20 - Math.random() * 60 : Math.random() * A, c: 12 + Math.random() * 8, v: 2.4 + Math.random() * 1.6 };
      };
      for (var g = 0; g < TOTAL; g++) gotas.push(novaGota(false));
      var alvoX = 0, alvoY = 0, bX = 0, bY = 0;
      if (ponteiroFino) {
        abre.addEventListener("pointermove", function (ev) {
          var r = abre.getBoundingClientRect();
          var nx = (ev.clientX - r.left) / r.width - 0.5, ny = (ev.clientY - r.top) / r.height - 0.5;
          vento = nx * 1.2;
          alvoX = nx * 26; alvoY = ny * 20;
        });
        abre.addEventListener("pointerleave", function () { alvoX = 0; alvoY = 0; });
      }
      var borda = null; // borda de cima da foto, medida uma vez por quadro
      var chao = function (x) {
        if (borda && x > borda.x && x < borda.x + borda.l && borda.y > 0) return borda.y;
        return A - 2;
      };
      var passo = function () {
        if (!rodando) return;
        var ra = chuva.getBoundingClientRect();
        if (foto) {
          var rf = foto.getBoundingClientRect();
          borda = { x: rf.left - ra.left, y: rf.top - ra.top, l: rf.width };
        }
        ctxC.clearRect(0, 0, L, A);
        if (titulo) {
          // desliza até o alvo em cerca de 0,7 s
          bX += (alvoX - bX) * 0.08; bY += (alvoY - bY) * 0.08;
          var rt = titulo.getBoundingClientRect();
          var cx = rt.left - ra.left + Math.min(rt.width, 520) * 0.45 + bX;
          var cy = rt.top - ra.top + rt.height * 0.5 + bY;
          ctxC.drawImage(brilho, cx - brilho.width / 2, cy - brilho.height / 2);
        }
        ctxC.strokeStyle = "rgba(27, 48, 41, 0.25)";
        ctxC.lineWidth = 1;
        ctxC.beginPath();
        gotas.forEach(function (d, i) {
          var limite = chao(d.x);
          d.y += d.v; d.x += vento;
          if (d.y >= limite && d.y - d.v < limite) {
            for (var k = 0; k < 3; k++) respingos.push({ x: d.x, y: limite, vx: (Math.random() - 0.5) * 1.6, vy: -0.6 - Math.random() * 1.2, vida: 14 });
            gotas[i] = novaGota(true);
            return;
          }
          if (d.y > A + 20) { gotas[i] = novaGota(true); return; }
          ctxC.moveTo(d.x, d.y);
          ctxC.lineTo(d.x - vento * 4, d.y - d.c);
        });
        ctxC.stroke();
        ctxC.fillStyle = "rgba(27, 48, 41, 0.3)";
        respingos = respingos.filter(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vida--;
          if (p.vida <= 0) return false;
          ctxC.fillRect(p.x, p.y, 1.5, 1.5);
          return true;
        });
        quadro = requestAnimationFrame(passo);
      };
      var abreNaTela = false;
      var ligaChuva = function () {
        if (rodando || document.hidden || !abreNaTela) return;
        rodando = true; quadro = requestAnimationFrame(passo);
      };
      var desligaChuva = function () { rodando = false; cancelAnimationFrame(quadro); };
      quandoVisivel(abre, function () { abreNaTela = true; ligaChuva(); }, function () { abreNaTela = false; desligaChuva(); });
      document.addEventListener("visibilitychange", function () { if (document.hidden) desligaChuva(); else ligaChuva(); });
    }

    /* Fechamento: folhas de clareira caindo devagar, só enquanto a seção está na tela */
    var fechamento = $(".fechamento");
    var folhas = $("#petalas");
    if (fechamento && folhas && folhas.getContext) {
      var LF = 0, AF = 0, girando = false, quadroF = 0, t = 0;
      var CORES = ["rgba(75, 107, 94, 0.35)", "rgba(75, 107, 94, 0.55)", "rgba(27, 48, 41, 0.22)", "rgba(75, 107, 94, 0.2)"];
      var ctxF = preparaCanvas(folhas, fechamento, function (l, a) { LF = l; AF = a; });
      var TOTALF = celular ? 20 : 35;
      var novaFolha = function (topo) {
        return {
          x: Math.random() * LF, y: topo ? -30 - Math.random() * 200 : Math.random() * AF,
          t: 6 + Math.random() * 7, v: 0.45 + Math.random() * 0.5, fase: Math.random() * 6.28,
          ang: Math.random() * 6.28, giro: (Math.random() - 0.5) * 0.02, cor: CORES[Math.floor(Math.random() * CORES.length)]
        };
      };
      var lista = [];
      for (var f = 0; f < TOTALF; f++) lista.push(novaFolha(false));
      var desenhaFolha = function (o) {
        ctxF.save();
        ctxF.translate(o.x, o.y);
        ctxF.rotate(o.ang);
        ctxF.fillStyle = o.cor;
        ctxF.beginPath();
        ctxF.moveTo(0, -o.t);
        ctxF.quadraticCurveTo(o.t * 0.7, 0, 0, o.t);
        ctxF.quadraticCurveTo(-o.t * 0.7, 0, 0, -o.t);
        ctxF.fill();
        ctxF.restore();
      };
      var passoF = function () {
        if (!girando) return;
        t += 0.016;
        ctxF.clearRect(0, 0, LF, AF);
        lista.forEach(function (o, i) {
          o.y += o.v * 0.8;
          o.x += Math.sin(t * 1.2 + o.fase) * 0.5 + 0.12;
          o.ang += o.giro;
          if (o.y > AF + 20 || o.x > LF + 20) { lista[i] = novaFolha(true); return; }
          desenhaFolha(o);
        });
        quadroF = requestAnimationFrame(passoF);
      };
      var fechaNaTela = false;
      var ligaFolhas = function () {
        if (girando || document.hidden || !fechaNaTela) return;
        girando = true; quadroF = requestAnimationFrame(passoF);
      };
      var desligaFolhas = function () { girando = false; cancelAnimationFrame(quadroF); };
      quandoVisivel(fechamento, function () { fechaNaTela = true; ligaFolhas(); }, function () { fechaNaTela = false; desligaFolhas(); });
      document.addEventListener("visibilitychange", function () { if (document.hidden) desligaFolhas(); else ligaFolhas(); });
    }
  }
})();
