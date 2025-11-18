import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("API de Veterinaria funcionando"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
