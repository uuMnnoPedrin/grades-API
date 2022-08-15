const express = require('express');
const winston = require('winston');
const fs = require('fs/promises');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const gradesRouter = require('./routes/grades.js')

const { readFile, writeFile } = fs;

global.fileName = "grades.json";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use("/grades", gradesRouter);

app.listen(3000, async() => {
    try{
        await readFile(global.fileName);
    }catch (err) {
        const initialJson = {
            nextId: 1,
            grades: []
        }
        writeFile(global.fileName, JSON.stringify(initialJson));
    }
})