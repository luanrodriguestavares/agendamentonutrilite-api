const express = require("express")
const cors = require("cors")
const routes = require("./routes")
const { models, syncModels } = require("./models")
const sequelize = require("./config/database")
const fs = require('fs');
const https = require('https');

require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

const createDefaultAdmin = async () => {
    try {
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "servicosnutriliteagendamento@gmail.com"
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "nutrilite"

        const adminExists = await models.User.findOne({ where: { email: adminEmail } })
        if (!adminExists) {
            await models.User.create({
                email: adminEmail,
                password: adminPassword,
                role: "admin",
            })
            console.log("Usuário admin criado com sucesso!")
        }
    } catch (error) {
        console.error("Erro ao criar usuário admin:", error)
    }
}

const initializeApp = async () => {
    try {
        await sequelize.sync({ alter: true })
        console.log("Modelos sincronizados com o banco de dados.")

        await createDefaultAdmin()
        console.log("Aplicação inicializada com sucesso!")
    } catch (error) {
        console.error("Erro ao inicializar aplicação:", error)
    }
}

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

const httpsOptions = {};
let useHttps = false;
try {
  httpsOptions.key = fs.readFileSync('src/server.key');
  httpsOptions.cert = fs.readFileSync('src/server.cert');
  useHttps = true;
} catch (err) {
  console.warn('Certificados SSL não encontrados. O servidor rodará em HTTP. Para HTTPS, gere server.key e server.cert na pasta src. Exemplo para gerar autoassinado:\nopenssl req -nodes -new -x509 -keyout src/server.key -out src/server.cert');
}

if (useHttps) {
  https.createServer(httpsOptions, app).listen(3443, HOST, () => {
    console.log('Servidor rodando em https://localhost');
    initializeApp();
  });
  return;
}

app.listen(PORT, HOST, () => {
  if (!useHttps) {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    initializeApp();
  }
});
