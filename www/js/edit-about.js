var personview;

document.addEventListener("DOMContentLoaded", function () {
    personview = new Vue({
        el: "#peoplelist",
        data: {
            people: []
        },
        mounted: function () {
            fetch("/person/list")
                .then(function (response) {
                    return response.json();
                })
                .then(function (listpersons) {
                    personview.people = listpersons;
                });
        }
    });
});


function deleteperson(id) {

    if (confirm('Delete this machine?')) {

        fetch('/person/'+ id + ' /delete', {
                method: 'POST',
                mode: 'cors'
            })
            .then(function (response) {
                return response.json()
            })
            .then(function (result) {
                if (result) {
                    M.toast({
                        html: 'Machine deleted!'
                    });
                    // updateView()
                    window.location.reload();
                }

            })

        /* $.post('/api/machine/' + id + '/delete', function (result) {
            updateView();
        }); */
    }
}