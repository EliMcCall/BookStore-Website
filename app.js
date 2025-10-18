const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');
const mongoUri = 'mongodb+srv://admin:admin@cluster0.l4hsj.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoUri)
.then(() => {
    app.listen(port, host, () => {
        console.log('Server is running on port', port);
    });
})
.catch(err => console.log(err.message));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error') || [];
    res.locals.successMessages = req.flash('success') || [];
    res.locals.searchTerm = req.query.search || '';
    next();
});

app.get('/', (req, res) => {
    res.render('index', { searchTerm: req.query.search || '' });  
});

app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500);
    res.render('error', { error: err, searchTerm: req.query.search || '' });
});
