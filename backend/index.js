import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const DATADIR = path.join(dirname, 'data');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

async function ensureDataDir() {
    try {
        await fs.mkdir(DATADIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            console.error('Failed to create data directory', err);
            process.exit(1);
        }
    }
}

app.get('/api/articles', async (req, res) => {
    try {
        const files = await fs.readdir(DATADIR);
        const articles = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => {
                    const filePath = path.join(DATADIR, file);
                    const data = await fs.readFile(filePath, 'utf8');
                    const article = JSON.parse(data);
                    return { id: article.id, title: article.title };
                })
        );
        res.json(articles);
    } catch (err) {
        console.error('Failed to list articles', err);
        res.status(500).json({ error: 'Failed to retrieve articles' });
    }
});

app.get('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    if (!id || !/^[a-f0-9\-]+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid article ID format' });
    }
    const filePath = path.join(DATADIR, `${id}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).json({ error: 'Article not found' });
        } else {
            console.error('Failed to read article', err);
            res.status(500).json({ error: 'Failed to retrieve article' });
        }
    }
});

app.post('/api/articles', async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required fields.' });
    }
    try {
        const newArticle = {
            id: randomUUID(),
            title,
            content
        };
        const filePath = path.join(DATADIR, `${newArticle.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(newArticle, null, 2));
        res.status(201).json(newArticle);
    } catch (err) {
        console.error('Failed to create article', err);
        res.status(500).json({ error: 'Failed to save article' });
    }
});

app.put('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!id || !/^[a-f0-9\-]+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid article ID format' });
    }
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required fields.' });
    }
    const filePath = path.join(DATADIR, `${id}.json`);
    try {
        // Check if article exists
        await fs.access(filePath);
        // Overwrite file
        const updatedArticle = { id, title, content };
        await fs.writeFile(filePath, JSON.stringify(updatedArticle, null, 2));
        res.json(updatedArticle);
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).json({ error: 'Article not found' });
        } else {
            console.error('Failed to update article', err);
            res.status(500).json({ error: 'Failed to update article' });
        }
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    if (!id || !/^[a-f0-9\-]+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid article ID format' });
    }
    const filePath = path.join(DATADIR, `${id}.json`);
    try {
        // Check if article exists
        await fs.access(filePath);
        await fs.unlink(filePath);
        res.status(204).end();
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).json({ error: 'Article not found' });
        } else {
            console.error('Failed to delete article', err);
            res.status(500).json({ error: 'Failed to delete article' });
        }
    }
});

async function startServer() {
    try {
        await ensureDataDir();
        app.listen(PORT, () => {
            console.log(`Backend server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('FATAL: Failed to start server', err.message);
        process.exit(1);
    }
}

startServer().catch(err => {
    console.error('Unhandled error during server startup', err);
    process.exit(1);
});
