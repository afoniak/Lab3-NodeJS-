const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;


const app = express();
const jsonParser = express.json();


const mongoClient = new MongoClient(
    'mongodb://localhost:27017/',
    {
        useUnifiedTopology: true,
    }
);


let dbClient;


app.use(express.static(__dirname + '/public'));


mongoClient.connect(function (err, client) {
    if (err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db('Order').collection('Order');
    app.listen(3000, function () {
        console.log('Сервер працює на порті 3000');
    });
});


app.get('/api/orders', function (req, res) {
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function (err, users) {
        if (err) return console.log(err);
        res.send(users);
    });
});
app.get('/api/orders/:id', function (req, res) {
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({ _id: id }, function (err, user) {
        if (err) return console.log(err);
        res.send(user);
    });
});


app.post('/api/orders', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);


    const PizzaName = req.body.pizza_name;
    const ClientName = req.body.client_name;
    const DateEndOrder = new Date(req.body.date_order_end);
    const Sum = req.body.sum;


    const order = {
        pizza_name: PizzaName,
        client_name: ClientName,
        date_order_end: DateEndOrder,
        sum: Sum,
    };


    const collection = req.app.locals.collection;
    collection.insertOne(order, function (err, result) {
        if (err) return console.log(err);
        res.send(order);
    });
});


app.delete('/api/orders/:id', function (req, res) {
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({ _id: id }, function (err, result) {
        if (err) return console.log(err);
        let order = result.value;
        res.send(order);
    });
});


app.put('/api/orders', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const PizzaName = req.body.pizza_name;
    const ClientName = new Date(req.body.client_name);
    const DateEndOrder = new Date(req.body.date_order_end);
    const Sum = req.body.sum;


    const collection = req.app.locals.collection;
    collection.findOneAndUpdate(
        { _id: id },
        {
            $set: {
                pizza_name: PizzaName,
                client_name: ClientName,
                date_order_end: DateEndOrder,
                sum: Sum,
            },
        },
        { returnOriginal: false },
        function (err, result) {
            if (err) return console.log(err);
            const order = result.value;
            res.send(order);
        }
    );
});


process.on('SIGINT', () => {
    dbClient.close();
    process.exit();
});
