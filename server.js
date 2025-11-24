import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API de Veterinaria funcionando"));

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Database connected", timestamp: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ============== CLIENTS ==============
app.get("/clients", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching clients" });
  }
});

app.get("/clients/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Client not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching client" });
  }
});

app.post("/clients", async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clients (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating client" });
  }
});

app.put("/clients/:id", async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *',
      [name, email, phone, address, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Client not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating client" });
  }
});

app.delete("/clients/:id", async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted", client: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting client" });
  }
});

// ============== VETERINARIANS ==============
app.get("/veterinarians", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM veterinarians ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching veterinarians" });
  }
});

app.get("/veterinarians/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM veterinarians WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Veterinarian not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching veterinarian" });
  }
});

app.post("/veterinarians", async (req, res) => {
  const { name, email, phone, specialty } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO veterinarians (name, email, phone, specialty) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, specialty]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating veterinarian" });
  }
});

app.put("/veterinarians/:id", async (req, res) => {
  const { name, email, phone, specialty } = req.body;
  try {
    const result = await pool.query(
      'UPDATE veterinarians SET name = $1, email = $2, phone = $3, specialty = $4 WHERE id = $5 RETURNING *',
      [name, email, phone, specialty, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Veterinarian not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating veterinarian" });
  }
});

app.delete("/veterinarians/:id", async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM veterinarians WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Veterinarian not found" });
    res.json({ message: "Veterinarian deleted", veterinarian: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting veterinarian" });
  }
});

// ============== PETS ==============
app.get("/pets", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching pets" });
  }
});

app.get("/pets/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Pet not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching pet" });
  }
});

app.get("/clients/:clientId/pets", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE client_id = $1 ORDER BY id', [req.params.clientId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching pets" });
  }
});

app.post("/pets", async (req, res) => {
  const { name, species, breed, birth_date, client_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pets (name, species, breed, birth_date, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, species, breed, birth_date, client_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating pet" });
  }
});

app.put("/pets/:id", async (req, res) => {
  const { name, species, breed, birth_date, client_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pets SET name = $1, species = $2, breed = $3, birth_date = $4, client_id = $5 WHERE id = $6 RETURNING *',
      [name, species, breed, birth_date, client_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Pet not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating pet" });
  }
});

app.delete("/pets/:id", async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pets WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Pet not found" });
    res.json({ message: "Pet deleted", pet: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting pet" });
  }
});

// ============== APPOINTMENTS ==============
app.get("/appointments", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY appointment_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching appointments" });
  }
});

app.get("/appointments/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching appointment" });
  }
});

app.post("/appointments", async (req, res) => {
  const { pet_id, vet_id, appointment_date, appointment_time, reason, status, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO appointments (pet_id, vet_id, appointment_date, appointment_time, reason, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [pet_id, vet_id, appointment_date, appointment_time, reason, status || 'scheduled', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating appointment" });
  }
});

app.put("/appointments/:id", async (req, res) => {
  const { pet_id, vet_id, appointment_date, appointment_time, reason, status, notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE appointments SET pet_id = $1, vet_id = $2, appointment_date = $3, appointment_time = $4, reason = $5, status = $6, notes = $7 WHERE id = $8 RETURNING *',
      [pet_id, vet_id, appointment_date, appointment_time, reason, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating appointment" });
  }
});

app.delete("/appointments/:id", async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted", appointment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting appointment" });
  }
});

// ============== MEDICAL RECORDS ==============
app.get("/medical-records", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_records ORDER BY record_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching medical records" });
  }
});

app.get("/medical-records/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Medical record not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching medical record" });
  }
});

app.get("/pets/:petId/medical-records", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY record_date DESC', [req.params.petId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching medical records" });
  }
});

app.post("/medical-records", async (req, res) => {
  const { pet_id, record_date, diagnosis, treatment, medications, notes, vet_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO medical_records (pet_id, record_date, diagnosis, treatment, medications, notes, vet_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [pet_id, record_date, diagnosis, treatment, medications, notes, vet_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating medical record" });
  }
});

app.put("/medical-records/:id", async (req, res) => {
  const { pet_id, record_date, diagnosis, treatment, medications, notes, vet_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE medical_records SET pet_id = $1, record_date = $2, diagnosis = $3, treatment = $4, medications = $5, notes = $6, vet_id = $7 WHERE id = $8 RETURNING *',
      [pet_id, record_date, diagnosis, treatment, medications, notes, vet_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Medical record not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating medical record" });
  }
});

app.delete("/medical-records/:id", async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM medical_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Medical record not found" });
    res.json({ message: "Medical record deleted", record: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting medical record" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));