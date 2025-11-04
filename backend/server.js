import 'dotenv/config';                 // loads .env locally; no harm in Azure
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',               // for Render.com PostgreSQL
  logging: false,
 dialectOptions: {
     ssl: { require: true, rejectUnauthorized: false }  // for Render.com PostgreSQL
 }
});

const Puppy = sequelize.define('puppies', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING(100), allowNull: false},
    breed: {type: DataTypes.STRING(100), allowNull: true},
    weight_lbs: {type: DataTypes.DECIMAL(5,2), allowNull: true},
    arrival_date:{type: DataTypes.DATE, allowNull: true, defaultValue: Sequelize.NOW},
    vaccinated: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
    }, {
    tableName: 'puppies', timestamps: false, underscored: true});


// Setup Routes --> Get/, Get/:id, PUT/:id, POST/, DELETE/:id

app.get('/puppies', async (req, res) => {
    const puppies = await Puppy.findAll();
    res.json(puppies);
});

app.get('/puppies/:id', async (req, res) => {
    const puppy = await Puppy.findByPk(req.params.id);
    if (puppy) {
        res.json(puppy);
    } else {
        res.status(404).json({ error: 'Puppy not found' });
    }
});

app.put('/puppies/:id', async (req, res) => {
    const puppy = await Puppy.findByPk(req.params.id);
    if (puppy) {
        await puppy.update(req.body);
        res.json(puppy);
    } else {
        res.status(404).json({ error: 'Puppy not found' });
    }
});

app.post('/puppies', async (req, res) => {
    const newPuppy = await Puppy.create(req.body);
    res.status(201).json(newPuppy);
});

app.delete('/puppies/:id', async (req, res) => {
    const puppy = await Puppy.findByPk(req.params.id);
    if (puppy) {
        await puppy.destroy();
        res.status(204).end();
    } else {
        res.status(404).json({ error: 'Puppy not found' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Database connected!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});