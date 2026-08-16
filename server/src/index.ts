import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.json({ status: 'API rodando' });
});

app.listen(3000, () => {
    console.log('Servidor rodando!');
});