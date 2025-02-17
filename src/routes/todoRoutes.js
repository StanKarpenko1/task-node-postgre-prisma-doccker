import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// Get all todos for logged-in user
router.get('/', async (req, res) => {
    try {
        // Ensure userId is present
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch todos for the logged-in user
        const todos = await prisma.todo.findMany({
            where: { userId: req.userId }
        });

        res.json({
            success: true,
            data: todos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// Create a new todo
router.post('/', async (req, res) => {
    const { task } = req.body;

    // Validate input
    if (!task || typeof task !== 'string') {
        return res.status(400).json({ error: 'Task is required and must be a string' });
    }

    try {
        // Create the todo
        const todo = await prisma.todo.create({
            data: {
                task,
                userId: req.userId
            }
        });

        res.status(201).json({ success: true, todo });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});


// Update a todo
router.put('/:id', async (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;

    try {
        // Validate id
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Update the todo
        const updatedTodo = await prisma.todo.update({
            where: {
                id: todoId,
                userId: req.userId // Ensures the user can only update their own todos
            },
            data: {
                completed: !!completed // Ensure a boolean value is stored
            }
        });

        res.json(updatedTodo);
    } catch (e) {
        console.error(e);

        if (e.code === 'P2025') {
            return res.status(404).json({ error: 'Todo not found or not authorized to update' });
        }

        res.status(500).json({ error: 'Failed to update todo' });
    }
});


// Delete a todo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Validate ID
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Verify that the todo belongs to the user
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id: todoId,
                userId: userId
            }
        });

        if (!existingTodo) {
            return res.status(404).json({ error: 'Todo not found or not authorized to delete' });
        }

        // Delete the todo
        await prisma.todo.delete({
            where: { id: todoId }
        });

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (e) {
        console.error(e);

        // Handle specific Prisma errors (e.g., record not found)
        if (e.code === 'P2025') {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.status(500).json({ error: 'Failed to delete todo' });
    }
});


export default router