const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.post('/usuarios', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                nombre,
                correo,
                contrasena,
                fechaCambioContrasena: new Date(),
            },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        // Obtener todos los usuarios
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nombre: true,
                correo: true,
                fechaCambioContrasena: true,
                diasExpiracion: true
            }
        });

        // Crear una consulta SQL personalizada para obtener el estado de la contraseña
        const usuariosConEstado = await Promise.all(
            users.map(async (user) => {
                const result = await prisma.$queryRaw`SELECT es_contrasena_vigente(${user.fechaCambioContrasena}, ${user.diasExpiracion}) AS contrasena_vigente`;
                const contrasenaVigente = result[0].contrasena_vigente;

                return {
                    nombre: user.nombre,
                    correo: user.correo,
                    contrasena_vigente: contrasenaVigente,
                };
            })
        );

        res.status(200).json(usuariosConEstado);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

module.exports = app;