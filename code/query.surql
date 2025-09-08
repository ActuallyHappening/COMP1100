SELECT * FROM student:`4988635` FETCH program; // Student
SELECT * FROM (student:`4988635`.program.program_requirements[0]); // Program Requirements
SELECT * FROM student:`4988635`.done, student:`4988635`.doing; // Courses
