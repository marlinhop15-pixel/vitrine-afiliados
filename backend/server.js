const express = require("express");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SECRET_KEY || ""
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    projeto: "Ofertas e Promoções"
  });
});

// Página protegida para iniciar a conexão
app.get("/meli/connect", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Conectar Mercado Livre</title>
    <body style="font-family:Arial;padding:25px">
      <h2>Conectar Mercado Livre</h2>
      <form method="POST" action="/meli/connect">
        <input
          type="password"
          name="password"
          placeholder="Senha de conexão"
          required
        >
        <button type="submit">Continuar</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/meli/connect", async (req, res) => {
  try {
    if (!process.env.MELI_CONNECT_PASSWORD) {
      return res.status(503).send("Conexão ainda não configurada.");
    }

    if (req.body.password !== process.env.MELI_CONNECT_PASSWORD) {
      return res.status(401).send("Senha incorreta.");
    }

    const required = [
      "MELI_CLIENT_ID",
      "MELI_REDIRECT_URI",
      "SUPABASE_URL",
      "SUPABASE_SECRET_KEY"
    ];

    if (required.some(key => !process.env[key])) {
      return res.status(503).send("Configuração incompleta.");
    }

    const state = crypto.randomBytes(32).toString("hex");

    const verifier = crypto
      .randomBytes(32)
      .toString("base64url");

    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

    const { error } = await supabase
      .from("meli_oauth_states")
      .insert({
        state,
        code_verifier: verifier,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

    if (error) {
      console.error("Erro ao guardar estado OAuth.");
      return res.status(500).send("Não foi possível iniciar a conexão.");
    }

    const url = new URL(
      "https://auth.mercadolivre.com.br/authorization"
    );

    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", process.env.MELI_CLIENT_ID);
    url.searchParams.set("redirect_uri", process.env.MELI_REDIRECT_URI);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");

    res.redirect(url.toString());

  } catch (error) {
    console.error("Erro ao iniciar OAuth.");
    res.status(500).send("Erro ao iniciar conexão.");
  }
});

// Recebe o retorno do Mercado Livre
app.get("/oauth/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).send("Autorização não concluída.");
    }

    if (!code || !state) {
      return res.status(400).send("Retorno de autorização inválido.");
    }

    const { data: registro, error: buscaErro } = await supabase
      .from("meli_oauth_states")
      .select("*")
      .eq("state", state)
      .maybeSingle();

    if (buscaErro || !registro) {
      return res.status(400).send("Estado de autorização inválido.");
    }

    await supabase
      .from("meli_oauth_states")
      .delete()
      .eq("state", state);

    if (new Date(registro.expires_at).getTime() < Date.now()) {
      return res.status(400).send("Autorização expirada. Tente novamente.");
    }

    if (
      !process.env.MELI_CLIENT_ID ||
      !process.env.MELI_CLIENT_SECRET ||
      !process.env.MELI_REDIRECT_URI
    ) {
      return res.status(503).send("Credenciais não configuradas.");
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.MELI_CLIENT_ID,
      client_secret: process.env.MELI_CLIENT_SECRET,
      code: String(code),
      redirect_uri: process.env.MELI_REDIRECT_URI,
      code_verifier: registro.code_verifier
    });

    const resposta = await fetch(
      "https://api.mercadolibre.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body
      }
    );

    const token = await resposta.json();

    if (!resposta.ok || !token.access_token || !token.refresh_token) {
      console.error("Falha na troca de código OAuth.");
      return res.status(400).send("Não foi possível concluir a conexão.");
    }

    const { error: salvarErro } = await supabase
      .from("meli_oauth_tokens")
      .upsert({
        meli_user_id: token.user_id,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: new Date(
          Date.now() + token.expires_in * 1000
        ).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: "meli_user_id"
      });

    if (salvarErro) {
      console.error("Erro ao salvar credenciais OAuth.");
      return res.status(500).send("Não foi possível guardar a conexão.");
    }

    res.send("Mercado Livre conectado com sucesso!");

  } catch (error) {
    console.error("Erro no retorno OAuth.");
    res.status(500).send("Erro ao concluir a conexão.");
  }
});

// Notificações: ainda não processa eventos
app.post("/notifications", (req, res) => {
  res.sendStatus(200);
  console.log("Notificação recebida.");
});

app.listen(PORT, () => {
  console.log(`Backend iniciado na porta ${PORT}`);
});
