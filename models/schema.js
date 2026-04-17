import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

app.set('view engine', 'ejs');

const connection = new Sequelize({
    dialect: 'sqlite',
    storage: './lap11.db',
    logging: false,
});

const Owner = connection.define('owner', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.TEXT, allowNull: false, unique: { args: true, msg: "Email already exists" } },
    password: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.TEXT },
    gender: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: false, freezeTableName: true });

const Pet = connection.define('pet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    species: { type: DataTypes.STRING, allowNull: false },
    breed: { type: DataTypes.STRING, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false },
    gender: { type: DataTypes.TEXT, allowNull: false },
    ownerId: { type: DataTypes.INTEGER, allowNull: false }     
}, { timestamps: false, freezeTableName: true });

const Appointment = connection.define('appointment', {
    pet: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.TEXT, allowNull: false },
    doctor: { type: DataTypes.STRING, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    ownerId: { type: DataTypes.INTEGER, allowNull: false }  
}, { timestamps: false, freezeTableName: true });

 
Owner.hasMany(Pet, { foreignKey: 'ownerId' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

Owner.hasMany(Appointment, { foreignKey: 'ownerId' });
Appointment.belongsTo(Owner, { foreignKey: 'ownerId' });

connection.sync();

export { connection, Owner, Pet, Appointment };