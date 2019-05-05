var Person = require("../models/person");

//Show all Persons
exports.person_list = function (req, res) {
    Person.find({}).exec(function (err, list_Person) {
        if (err) {
            throw err;
        }
        res.send(list_Person);
    });
    //res.send('NOT IMPLEMENTED: Enquiry list');
};

//
exports.person_create = function (req, res) {
    var person = new Person({
        name: req.body.name,
        comments: req.body.comments,
        position: req.body.position,
        education: req.body.education
    });


    person.save(function (err) {
        if (err) {
            throw err;
        }
        //successful - redirect to new book record.
        res.send(person);
    });

    //res.send('NOT IMPLEMENTED: Enquiry create POST');
};


exports.person_delete_all_get = (req, res) => {
    Person.remove({}, (err, result) => {
        if (err) return res.status(500).send(err)

        if (result) return res.send(result)

        return res.send(false)
    })
}


exports.person_delete_post = (req, res) => {
	Person.findByIdAndRemove(req.params.id, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(true)

		return res.send(false)
	})
}
