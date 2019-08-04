const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      expressSanitizer = require('express-sanitizer'),
      methodOverride = require('method-override');
mongoose.connect('mongodb://localhost/blog_app', {useNewUrlParser: true});
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date, default:Date.now}
});

const Blog = mongoose.model('Blog', blogSchema );

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

/* Blog.create({
    title: 'Test Blog',
    image: 'this is supposed to be an image',
    body: 'Hello World!'
}) */

app.get('/', (req, res) => {
    res.redirect('/blogs');
})

app.get('/blogs', (req, res) => {
    Blog.find({}).then(items => res.render('index', {items})).catch(err => console.log(err));  
})

app.get("/blogs/new", (req, res) => {
    res.render('new')
})

app.get('/blogs/:id',(req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect('/blogs');
            console.log(err);
        } else{ 
        res.render('show', {blog: foundBlog});
        }
    })
})

// edit route
app.get('/blogs/:id/edit', (req, res) => {

    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs')
        } else {
            res.render('edit', {blog: foundBlog});
        }
    })
})

// Adding put route to save edited changes
app.put('/blogs/:id', (req, res) => {
    req.body.body = req.sanitize(req.body.body);
    Blog.findByIdAndUpdate(req.params.id, req.body, (err, updatedBlog) => {
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/'+req.params.id);
        }
    })
})
app.post('/blogs', (req, res) => {
    req.body.body = req.sanitize(req.body.body);
    Blog.create(req.body)
        .then(item => res.redirect('/blogs'))
        .catch(err => console.log(err));
});
// Delete route
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err) 
            res.redirect('/blogs');
        else
            res.redirect('/blogs')
    })
})

app.listen(3000, () => {
    console.log('Listening on port 3000\nGo to this link below to preview\nhttp://localhost:3000/');
})