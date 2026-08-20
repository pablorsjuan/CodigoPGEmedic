const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL de conexión base de datos MongoDB
const dbUrl = 'mongodb://localhost/PGEmedic';                

// Conexión a la base de datos

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Conexión a MongoDB exitosa');
}).catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
});


const pacienteSchema = new mongoose.Schema({
    Primer_nombres: String,
    Segundo_nombres: String,
    Primer_apellidos: String,
    Segundo_apellidos: String,
    correo: String,
    identificacion: String,
    telefono: String,
    otro_telefono: String,
    direccion: String,
    historias_clinicas: { type: [mongoose.Schema.Types.Mixed], default: [] }
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

// Esquema Medico
const medicoSchema = new mongoose.Schema({
    nombre: String,
    especializacion: String,
    usuario: String,
    contrasena: String
});

const Medico = mongoose.model('Medico', medicoSchema);

// Ruta para registrar paciente
app.post('/registroForm', async (req, res) => {
    try {
        console.log("📩 Datos recibidos:", req.body); // <-- debug
        const nuevoPaciente = new Paciente(req.body);
        await nuevoPaciente.save();
        res.status(201).send({ message: 'Paciente registrado exitosamente' });
    } catch (error) {
        console.error("❌ Error al registrar:", error);
        res.status(500).send({ message: 'Error al registrar el paciente', error });
    }
});

// Ruta para agregar una historia clínica al paciente identificado por "identificacion"
app.post('/registrarHistoria', async (req, res) => {
    try {
        // Se espera en el body: { identificacion: '...', <campos_historia> }
        const { identificacion, ...historia } = req.body;
        if (!identificacion) {
            return res.status(400).send({ message: 'Identificación del paciente es requerida' });
        }

        // Añadir fecha si no viene proporcionada
        const historiaObj = { ...historia, fecha: historia.fecha || new Date() };

        const paciente = await Paciente.findOneAndUpdate(
            { identificacion: identificacion },
            { $push: { historias_clinicas: historiaObj } },
            { new: true }
        );

        if (!paciente) {
            return res.status(404).send({ message: 'No existe paciente con esa identificación' });
        }

        res.status(200).send({ message: 'Historia clínica agregada correctamente', paciente });
    } catch (error) {
        console.error('❌ Error agregando historia clínica:', error);
        res.status(500).send({ message: 'Error al agregar la historia clínica', error });
    }
});

// Rutas para servir archivos estáticos
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});




// +++++++ METODO DE CAMBIO DE CONTRASEÑA ++++++++++

app.post("/cambiarContrasena", async (req, res) => {
  const { correo, nuevaContrasena } = req.body;

  if (!correo || !nuevaContrasena) {
    return res.status(400).send({ message: "Correo y nueva contraseña son requeridos" });
  }

  try {
    const paciente = await Paciente.findOneAndUpdate(
      { correo: correo },                       // buscar por correo
      { contrasena: nuevaContrasena },          // actualizar contraseña
      { new: true }                             // devolver documento actualizado
    );

    if (!paciente) {
      return res.status(404).send({ message: "No existe usuario con ese correo" });
    }

    res.status(200).send({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error cambiando contraseña:", error);
    res.status(500).send({ message: "Error en el servidor", error });
  }
});