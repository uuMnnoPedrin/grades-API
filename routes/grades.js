const express = require('express');
const fs = require('fs/promises');
const cors = require('cors');

const { readFile, writeFile } = fs;

const router = express.Router();

//Get all grades
router.get("/", async(req, res, next) => {
    try{

        const data = JSON.parse(await readFile(global.fileName));

        delete data.nextId;

        res.send(data);

    }catch (err){

        next(err);

    }
})

//Get Specific by ID
router.get("/:id", async (req, res, next) => {
    try{

        const data = JSON.parse(await readFile(global.fileName));

        const grade = data.grades.find(

            grade => grade.id === parseInt(req.params.id)

        );

        res.send(grade);

    }catch(err){

        next(err);

    }
})

//Add new grade
router.post("/", async(req, res, next) => {
    try{
        let grade = req.body;

        if(!grade.student || !grade.subject || !grade.type || grade.value == null){

            throw new Error("Student, Subject, Type e Value são obrigatórios.");

        }

        const data = JSON.parse(await readFile(global.fileName));
        
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        
        grade = {
            id: data.nextId++,
            student: grade.student,
            subject: grade.subject,
            type: grade.type,
            value: grade.value,
            timestamp: dateTime
        };
        data.grades.push(grade);

        await writeFile(global.fileName, JSON.stringify(data, null, 2));
        
        res.send(grade);
    
    }catch(err){

        next(err);

    }
})

//Edit by ID
router.patch("/:id", async (req, res, next) => {
    try{

        const grade = req.body;

        const data = JSON.parse(await readFile(global.fileName));

        var idx = parseInt(req.params.id);

        const index = data.grades.findIndex(g => g.id === parseInt(req.params.id));

        if (!grade.student || !grade.subject || !grade.type || grade.value == null){

            throw new Error("Student, Subject, Type e Value são obrigatórios.");

        }

        if (index === -1){

            throw new Error("Registro não encontrado");

        }

        data.grades[index].student = grade.student;
        data.grades[index].subject = grade.subject;
        data.grades[index].type = grade.type;
        data.grades[index].value = grade.value;

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.send(data.grades[index]);

    }catch(err){

        next(err);

    }
})

//Delete by ID
router.delete("/:id", async (req, res, next) => {
    try{
        const data = JSON.parse(await readFile(global.fileName));

        data.grades = data.grades.filter(

            grade => grade.id !== parseInt(req.params.id)

        );

        await writeFile(global.fileName, JSON.stringify(data, null, res.end()));

    } catch (err){

        next(err);

    }
});

//Total grade
router.post("/total/", async(req, res, next) => {
    try{

        const data = JSON.parse(await readFile(global.fileName));

        sent = req.body;

        const response = data.grades.filter(
            grade => grade.student == sent.student && grade.subject == sent.subject
        )

        var total = 0

        for (var i = 0; i < response.length; i++){
            total += response[i].value;
        }

        res.send({'total': `${total}`});

    }catch (err){

        next(err);

    }
});

//Average grade
router.post("/avg/", async(req, res, next) =>{
    try{

        const data = JSON.parse(await readFile(global.fileName));

        sent = req.body;

        const response = data.grades.filter(

            grade => grade.student == sent.student && grade.subject == sent.subject

        )
        var avg = 0
        for (var i = 0; i < response.length; i++){

            avg += response[i].value;

        }
        avg = avg/response.length;
        res.send({'average': `${avg.toFixed(2)}`})

    }catch (err){

        next(err);

    }
});

//Best grades from a student
router.post("/big/", async(req, res, next) => {
    try{
        const data = JSON.parse(await readFile(global.fileName));

        gradeTotal = req.body;
        
        const response = data.grades.filter(
            grade => grade.student == gradeTotal.student && grade.subject == gradeTotal.subject
        );

        var maior = 0;
        var notas = [];
        for(var i = 0; i < response.length; i++){
            if(response[i].value >= maior){
                maior = response[i].value;
                notas.push(response[i].value);
                
                notas.sort(function(a, b) {
                    return b - a;
                });

                if(notas.length > 3){
                    while(notas.length > 3){
                        notas.pop();
                    }
                }
            }
        }

        res.send({'biggest grades': `${notas}`});

    }catch (err){
        next(err);

    }
});
module.exports = router;