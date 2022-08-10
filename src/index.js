const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();

const customers = [];

function verifyIfExitsAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return res.status(400).json({error: "Customer not found!"});
    }

    req.customer = customer;

    return next();
}

function getBalance(statement) {
    statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        }

        return acc - operation.amount;
    }, 0);
}

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

app.get("/statement", verifyIfExitsAccountCPF,(req, res) => {
    const { customer } = req; 
    return res.status(200).json(customer.statement);
});

app.get("/statement/date", verifyIfExitsAccountCPF,(req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());
    res.status(200).json(statement);
});

app.post("/deposit", verifyIfExitsAccountCPF, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    };
    customer.statement.push(statementOperation);

    return res.status(201).json({message: "deposit was created"});
});

app.post("/withdraw", verifyIfExitsAccountCPF, (req, res) => {
    const { customer } = req;
    const { amount } = req.body;

    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return res.status(400).json({error: "Insufficient amount!"});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    };

    customer.statement.push(statementOperation);

    return res.status(200).json({message: 'Withdraw successfully'})
});

app.listen(3031);