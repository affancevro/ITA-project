


var f_name = document.getElementById("#f_name");
var l_name = document.getElementById("#l_name");
var id = document.getElementById("#id");
var age = document.getElementById("#age")



var addbtn = document.getElementById("#addbtn")
var removebtn = document.getElementById("#removebtn")
var updatebtn = document.getElementById("#updatebtn")


addbtn.addEventListener("click",  (e) => {
 e.preventDefault();
firebase.firestore().collection("admin").set({
     firstname: f_name.value,
     lastname: l_name.value,
     age: age.value,
 })
});

updatebtn.addEventListener("click",  (e) => {
    e.preventDefault();
    var newData = {
        firstname: f_name.value,
        lastname: l_name.value,
        age: age.value,

    }
        
    })
