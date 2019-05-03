var Person = require('../models/person');


//Show all Persons
exports.person_list = function (req, res) {
    Person.find({})
        .exec(function (err, list_Person) {
            if (err) {
                throw err;
            }
            res.send(list_Person);
        });
    //res.send('NOT IMPLEMENTED: Enquiry list');
};