require('dotenv').config();

const {ResourceError} = require("@VanillaCX/Errors");
const express = require("express");
const helmet = require("helmet");

// Entry point routes
const publicRoute = require("./routes/public");
const authorisedRoute = require("./routes/authorised");

// Set port the app listens to
const port = process.env.PORT || 3000;

// Create app
const app = express();

// Set Helmet usage for security
app.use(helmet());

// Remove fingerprinting of the Server Software
app.disable('x-powered-by');

// Set EJS as templating engine  
app.set('view engine', 'ejs');  

// Enables static access to filesystem
app.use('/public', express.static('public'));

// Middleware for all requests
app.use((req, res, next) => {
    console.log(`Request at ${Date.now()}`);

    next();
})

const {Query} = require("@VanillaCX/QueryCX");

const query = new Query({
    database: process.env.QUERYCX_DATABASE,
    collection: process.env.QUERYCX_COLLECTION
});

app.get("/save-to-db", async (req, res) => {
    try {
        const time = Date.now();
        const document = {time: time, name: "Lee"};
        const result = await query.insertOne(document)
        console.log("insertOne result:", result);

        res.send(document)
    
    } catch(error){
        console.log("insertOne error", error);
    }
})

// Fallback for un-matched requests
app.use((req, res) => {
    const resourceErr = new ResourceError(req.originalUrl, 404);
    console.error(resourceErr)

    res.status(resourceErr.status.code)
       .render("errors/resource", {resourceErr})
})

app.listen(port, () => console.log(`Server listening on port: ${port}`));