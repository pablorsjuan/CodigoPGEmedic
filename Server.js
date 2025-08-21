const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// URL de conexión base de datos MongoDB
const dbUrl = 'mongodb://localhost:27017/PGEmedic';                

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
    nombres: String,
    apellidos: String,
    correo: String,
    identificacion: String,
    telefono: String,
    otro_telefono: String,
    direccion: String,
    historias_clinicas: Array
});

app.post('/registrar_paciente', async (req, res) => {
    try {
        const nuevoPaciente = new Paciente(req.body);
        await nuevoPaciente.save();
        
        res.status(201).send({ message: 'Paciente registrado exitosamente' });
    } catch (error) {
        
        res.status(500).send({ message: 'Error al registrar el paciente', error });
    }
});

// ... (código del listen) ...
const medicoSchema = new mongoose.Schema({
    nombre: String,
    especializacion: String,
    usuario: String,
    contrasena: String
});

const Paciente = mongoose.model('Paciente', pacienteSchema);
const Medico = mongoose.model('Medico', medicoSchema);

app.use(express.json()); 

app.post('/registrar_paciente', async (req, res) => {
    try {
        const nuevoPaciente = new Paciente(req.body);
        await nuevoPaciente.save();
        res.status(201).send({ message: 'Paciente registrado exitosamente' });
    } catch (error) {
        res.status(500).send({ message: 'Error al registrar el paciente', error });
    }
});

// Rutas para servir los archivos HTML
app.use(express.static('public')); 

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});