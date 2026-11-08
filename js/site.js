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
    menuBotao.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      menuBotao.setAttribute("aria-expanded", aberto ? "true" : "false");
      menuBotao.textContent = aberto ? "Fechar" : "Menu";
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("aberto");
        menuBotao.setAttribute("aria-expanded", "false");
        menuBotao.textContent = "Menu";
      });
    });
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
          resumoTexto.textContent = "Pré-reserva simulada: " + DIAS_LONGO[estado.dia.getDay()] + ", " + fmtCurta(estado.dia) + ", às " + h + ", " + (estado.modalidade === "online" ? "online" : "presencial") + ". Nada foi reservado de verdade.";
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
})();
