// API index: connect routes
import express from 'express';
import salesRouter from './sales';
import mauticRouter from './mautic';
import analyticsRouter from './analytics';

const app = express();
app.use(express.json());
app.use('/sales', salesRouter);
app.use('/mautic', mauticRouter);
app.use('/analytics', analyticsRouter);

export default app;
