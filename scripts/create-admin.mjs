import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const nome = "Higor Araujo";
const email = "higor@numer.com.br";
const senha = "Numer@2026";
const role = "admin";

const passwordHash = await bcrypt.hash(senha, 12);

const conn = await mysql.createConnection(DATABASE_URL);

try {
  // Check if user already exists
  const [rows] = await conn.execute("SELECT id FROM internalUsers WHERE email = ?", [email]);
  if (rows.length > 0) {
    console.log(`Usuário ${email} já existe. Atualizando senha e role...`);
    await conn.execute(
      "UPDATE internalUsers SET passwordHash = ?, role = ?, ativo = 1 WHERE email = ?",
      [passwordHash, role, email]
    );
  } else {
    await conn.execute(
      "INSERT INTO internalUsers (nome, email, passwordHash, role, ativo) VALUES (?, ?, ?, ?, 1)",
      [nome, email, passwordHash, role]
    );
    console.log(`Usuário admin criado com sucesso!`);
  }
  console.log(`\n✅ Usuário admin pronto:`);
  console.log(`   E-mail: ${email}`);
  console.log(`   Senha:  ${senha}`);
  console.log(`\n⚠️  Altere a senha após o primeiro login!`);
} finally {
  await conn.end();
}
