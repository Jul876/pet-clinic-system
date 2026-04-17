import express from 'express';
import session from 'express-session';
import { connection as sequelize, Owner, Pet, Appointment } from './models/schema.js';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());//

// Session setup
app.use(session({
    secret: 'Secret333',
    name: 'lab12',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

// DB Connection
try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
} catch (error) {
    console.error("Database connection error:", error);
}

// Middleware to protect routes
const checklogin = (req, res, next) => {
    if (!req.session.owner) {
        return res.redirect('/Login');
    }
    res.locals.owner = req.session.owner;
    next();
};




// Home Page
app.get('/home', (req, res) => {
    res.render('home', { Owner: req.session.owner });
});

// LOGIN PAGE
app.get('/Login', (req, res) => {
    res.render('Login', { data: {}, error: null });
});

// LOGIN POST
app.post('/Login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('Login', { data: req.body, error: "Please fill in all fields." });
    }

    const owner = await Owner.findOne({ where: { email } });

    if (!owner) {
        return res.render('Login', { data: req.body, error: "No matching user found." });
    }

    if (owner.password !== password) {
        return res.render('Login', { data: req.body, error: "Incorrect email or password." });
    }

    req.session.owner = owner.dataValues;
    res.redirect('/profile');
});

// SIGNUP
app.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

app.post('/signup', async (req, res) => {
    const { name, email, password,phone,gender} = req.body;
    if (!name || !email || !password || !phone || !gender) {
        return res.render('signup', { error: "Please fill in all fields." });
    }

    try {
        await Owner.create({ name, email, password,phone,gender });
        res.redirect('/Login');
    } catch (err) {
        console.log(err);
        res.render('signup', { error: "Error creating account. Try again." });
    }
});

// PROFILE
app.get('/profile', checklogin, (req, res) => {
    res.render('profile', { Owner: req.session.owner });
});

// UPDATE PAGE
app.get('/update', checklogin, (req, res) => {
    res.render('update', { Owner: req.session.owner, error: null });
});

// UPDATE POST
app.post('/update', checklogin, async (req, res) => {
    const { name, email, password,phone } = req.body;

    if (!name || !email || !phone) {
        return res.render('update', {
            Owner: req.session.owner,
            error: "Please fill in all fields."
        });
    }

    await Owner.update(
        { name, email, password,phone },
        { where: { id: req.session.owner.id } }
    );

    const updatedOwner = await Owner.findByPk(req.session.owner.id);
    req.session.owner = updatedOwner.dataValues;

    res.redirect('/profile');
});

// PETS
app.get('/pets', checklogin, async (req, res) => {
    const allPets = await Pet.findAll({
        where: { ownerId: req.session.owner.id }
    });
    res.render('pets', { pets: allPets });
});

app.get('/addpet', checklogin, (req, res) => {
    res.render('addpet', { error: null });
});

app.post('/pets/add', checklogin, async (req, res) => {
    const { name, age, species, breed, weight, gender } = req.body;

    if (!name || !age || !species || !breed || !weight || !gender) {
        return res.render('Addpet', { error: "Please fill in all fields." });
    }

    try {
        await Pet.create({ name, age, species, breed, weight, gender,ownerId:req.session.owner.id});
        res.redirect('/pets');
    } catch (err) {
        console.log(err);
        res.render('Addpet', { error: "Error adding Pet." });
    }
});

// PET DETAILS
app.get('/pets/:id', checklogin, async (req, res) => {
    const pet = await Pet.findByPk(req.params.id);
    res.render('petdetails', { pet });
});

// DELETE PET
app.get('/pets/delete/:id', checklogin, async (req, res) => {
    await Pet.destroy({ where: { id: req.params.id } });
    res.redirect('/pets');
});



// APPOINTMENTS
app.get('/appointment', checklogin, async (req, res) => {
    const allAppointments = await Appointment.findAll({
        where: { ownerId: req.session.owner.id }
    });
    res.render('appointment', { appointments: allAppointments });
});

app.get('/addappointment', checklogin, (req, res) => {
    res.render('addappointment', { error: null });
});

app.post('/addappointment', checklogin, async (req, res) => {
    const { date, doctor, reason, pet } = req.body;

    if (!date || !doctor || !reason || !pet) {
        return res.render('addappointment', { error: "Please fill in all fields." });
    }

    try {
        await Appointment.create({ date, doctor, reason, pet,ownerId:req.session.owner.id });
        res.redirect('/appointment');
    } catch (err) {
        console.log(err);
        res.render('addappointment', { error: "Error adding appointment." });
    }
});

// LOGOUT
app.get('/logout', checklogin, (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.clearCookie('lab12');
        res.redirect('/Login');
    });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.listen(3000, () => 
    console.log("Server running on port 3000"));
