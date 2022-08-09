const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();

const customers = [];

app.use(express.json());

app.post("/account", (req, res) => {
    const { cpf, name } = req.body;

    const customersAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if(customersAlreadyExists) {
        return res.status(400).json({error: "Customer already exists!"});
    }

    customers.push({
        cpf, 
        name,
        id: uuidV4(), 
        statement: []
    });
    
    return res.status(200).json({message: 'Account created successfully!'})
});

app.listen(3031);