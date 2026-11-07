const express = require("express");

const app = express();

app.use(express.json({ limit: "100kb" }));

// Verifica se o servidor está funcionando
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    projeto: "Ofertas e Promoções"
  });
});

// Recebe notificações do Mercado Livre
app.post("/notifications", (req, res) => {
  // Confirma o recebimento rapidamente
  res.sendStatus(200);

  // Registro básico do evento
  const topic = req.body?.topic || "não informado";
  console.log("Notificação recebida:", topic);
});

// Porta utilizada pelo Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend iniciado na porta ${PORT}`);
});

