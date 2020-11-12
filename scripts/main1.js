
var config = {

    apiKey: "AIzaSyA4FWYH34QpYce_BmPYTDUn1ZtDxFeCPmc",
    authDomain: "artikli.firebaseapp.com",
    databaseURL: "https://artikli.firebaseio.com",
    projectId: "artikli",
    storageBucket: "artikli.appspot.com",
    messagingSenderId: "418732563898",
    appId: "1:418732563898:web:e255fb9e025945ba141183",
    measurementId: "G-LXF3YX0LDV"

};
firebase.initializeApp(config);


var auth = firebase.auth();
var db = firebase.firestore();



var posts = document.querySelector("#posts");
var createForm = document.querySelector("#createForm");
var progressBar = document.querySelector("#progressBar");
var progressHandler = document.querySelector("#progressHandler");
var postSubmit = document.querySelector("#postSubmit");
var openNav = document.querySelector("#openNav");
var closeNav = document.querySelector("#closeNav");
var loading = document.querySelector("#loading");
var editButton = document.querySelector("#edit");
var deleteButton = document.querySelector("#delete");
var singlePost = document.querySelector("#post")
var editFormContainer = document.querySelector("#editFormContainer")
var pagination = document.querySelector("#pagination")
var editMode = false;


var currentTitle;
var currentId;
var currentContent;
var oldPostCover;

var lastVisible;
var postsArray = [];
var size;
var postSize;






var getPosts = async () => {


    var docs;
    var postsRef = firebase.firestore().collection("posts").orderBy("title").limit(3);

    var _size = await firebase.firestore().collection("posts").get();
    size = _size.size;

    await postsRef.get().then(documentSnapshots => {
        docs = documentSnapshots;
        console.log(docs)

        lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        console.log("last", lastVisible);
    });

    docs["docs"].forEach(doc => {


        postsArray.push({ "id": doc.id, "data": doc.data() });
    })

    if (postsArray.length > 0) {
        pagination.style.display = "block";
    } else {

        pagination.style.display = "none";
    }
    await createChildren(postsArray);
    postSize = posts.childNodes.length;
}
var paginate = async () => {
    console.log("paginating")
    var docs;
    var postsRef = firebase.firestore().collection("posts").orderBy("title").startAfter(lastVisible).limit(3);
    await postsRef.get().then(documentSnapshots => {
        docs = documentSnapshots;
        lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    })


    docs["docs"].forEach((doc, i) => {

        var div = document.createElement("div");
        var cover = document.createElement("div");
        var anchor = document.createElement("a");
        var anchorNode = document.createTextNode(doc.data().title);
        anchor.setAttribute("href", "post.html#/" + doc.id);

        anchor.appendChild(anchorNode);
        cover.style.backgroundImage = "url(" + doc.data().cover + ")";
        div.classList.add("post");
        div.appendChild(cover);
        div.appendChild(anchor);
        posts.appendChild(div);

        postSize++;

    })
    if (postSize >= size) {
        pagination.style.display = "none";
    }
}

if (pagination != null) {
    pagination.addEventListener("click", () => {
        paginate();
    })
}

var getPost = async () => {
    var postId = getPostsIdFromURL();


    if (loading != null) {
        loading.innerHTML = "<div class='lds-facebook'><div></div><div></div><div></div></div><p>Ucitavanje Sadrzaja..</p>";
    }

    var post = await firebase.firestore().collection("posts").doc(postId).get().catch(err => console.log(err));

    currentId = post.id;
    currentContent = post.data().content;
    currentTitle = post.data().title;
    oldPostCover = post.data().fileref;

    if (loading != null) {
        loading.innerHTML = "";
    }

    if (post && deleteButton != null) {
        deleteButton.style.display = "block";

    }
    if (post && editButton != null) {
        editButton.style.display = "block";

    }
    createChild(post.data());

}

var createChild = (postData) => {

    if (singlePost !== null) {
        var div = document.createElement("div");
        var img = document.createElement("img");
        img.setAttribute("src", postData.cover);
        img.setAttribute("loading", "lazy");
        img.setAttribute("id", "size")

        var title = document.createElement("h3");
        var titleNode = document.createTextNode(postData.title);
        title.setAttribute("id", "color");

        title.appendChild(titleNode);

        var content = document.createElement("div");
        var contentNode = document.createTextNode(postData.content);

        content.setAttribute("id", "color")
        content.appendChild(contentNode);

        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(content);

        post.appendChild(div);

    }
}

getPostsIdFromURL = () => {
    var postLocation = window.location.href;
    var hrefArray = postLocation.split("/");
    var postId = hrefArray.slice(-1).pop();
    return postId;
}



var createChildren = async (arr) => {
    if (posts != null) {
        arr.map(post => {
            var div = document.createElement("div");
            var cover = document.createElement("div");
            var anchor = document.createElement("a");
            var anchorNode = document.createTextNode(post.data.title);
            anchor.setAttribute("href", "post.html#/" + post.id);

            anchor.appendChild(anchorNode);
            cover.style.backgroundImage = "url(" + post.data.cover + ")";
            div.classList.add("post");
            div.appendChild(cover);
            div.appendChild(anchor);
            posts.appendChild(div);
        });

    }
}

//edit form

var appendEditForm = async () => {
    var d;


    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("id", "editForm");

    var titleInput = document.createElement("input");
    titleInput.setAttribute("value", currentTitle)
    titleInput.setAttribute("id", "editTitle")

    var contentTextArea = document.createElement("textarea");
    contentTextArea.setAttribute("id", "editContent");

    var coverFile = document.createElement("input");
    coverFile.setAttribute("type", "file");
    coverFile.setAttribute("id", "editCover");

    var oldCover = document.createElement("input");
    oldCover.setAttribute("type", "hidden");
    oldCover.setAttribute("id", "oldCover")

    var submit = document.createElement("input")
    submit.setAttribute("type", "submit");
    submit.setAttribute("value", "Uredi Artikal")
    submit.setAttribute("id", "editSubmit");



    form.appendChild(titleInput);
    form.appendChild(contentTextArea);
    form.appendChild(coverFile);
    form.appendChild(oldCover);
    form.appendChild(submit);
    editFormContainer.appendChild(form);


    document.getElementById("editContent").value = currentContent;
    document.getElementById("oldCover").value = oldPostCover;

    document.querySelector("#editForm").addEventListener("submit", async (e) => {
        e.preventDefault()



       
        if (document.getElementById("editTitle").value != "" && document.getElementById("editContent").value != "") {

            if (document.getElementById("editCover").files[0] != undefined) {
                var cover = document.getElementById("editCover").files[0];
                var storageRef = firebase.storage().ref();
                var storageChild = storageRef.child(cover.name);
                console.log("Updating File");

                var postCover = storageChild.put(cover);

                await new Promise((resolve) => {
                    postCover.on("state_changed", (snapshot) => {
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(Math.trunc(progress));

                        if (progressHandler != null) {
                            progressHandler.style.display = "block";

                        }
                        if (postSubmit != null) {
                            postSubmit.disabled = true;
                        }
                        if (progressBar != null) {
                            progressBar.value = progress;
                        }
                    }, (error) => {
                        console.log(error)
                    }, async () => {
                        var downloadURL = await storageChild.getDownloadURL();
                        d = downloadURL;
                        console.log(d)
                        resolve();
                    });

                });

                var fileRef = await firebase.storage().refFromURL(d);

                await storageRef.child(document.getElementById("oldCover").value).delete().catch(err => {
                    console.log(err)
                })

                console.log("prethodna slika se upload");

                var post = {
                    title: document.getElementById("editTitle").value,
                    content: document.getElementById("editContent").value,
                    cover: d,
                    fileref: fileRef.location.path
                }

                await firebase.firestore().collection("posts").doc(currentId).set(post, { merge: true })

                location.reload();




            } else {

                await firebase.firestore().collection("posts").doc(currentId).set({
                    title: document.getElementById("editTitle").value,
                    content: document.getElementById("editContent").value

                }, { merge: true })

                location.reload();

            }





        }




    })

}



if (editButton != null) {

    editButton.addEventListener("click", () => {
        if (editMode == false) {
            editMode = true;
            console.log("enabling edit")

            appendEditForm();
        }
        else {
            editMode = false;
            console.log("disabling edit mode")

            removeEditForm();
        }
    })

}

var removeEditForm = () => {
    var editForm = document.getElementById("editForm")

    editFormContainer.removeChild(editForm)
}
//create form
if (createForm != null) {
    var d;
    createForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        if (document.getElementById("title").value != "" && document.getElementById("content").value != "" && document.getElementById("cover").files[0] != "") {
            var title = document.getElementById("title").value;
            var content = document.getElementById("content").value;
            var cover = document.getElementById("cover").files[0];
            console.log(cover)


            var storageRef = firebase.storage().ref();
            var storageChild = storageRef.child(cover.name)
            console.log("Uploading file...")

            var postCover = storageChild.put(cover);
            await new Promise((resolve) => {
                postCover.on("state_changed", (snapshot) => {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(Math.trunc(progress));

                    if (progressHandler != null) {
                        progressHandler.style.display = "block";

                    }
                    if (postSubmit != null) {
                        postSubmit.disabled = true;
                    }
                    if (progressBar != null) {
                        progressBar.value = progress;
                    }
                }, (error) => {
                    console.log(error)
                }, async () => {
                    var downloadURL = await storageChild.getDownloadURL();
                    d = downloadURL;
                    console.log(d)
                    resolve();
                });

            })

            var fileRef = await firebase.storage().refFromURL(d);

            var post = {
                title,
                content,
                cover: d,
                fileref: fileRef.location.path

            }
            await firebase.firestore().collection("posts").add(post);
            console.log("post added ");

            if (postSubmit != null) {
                window.location.replace("store.html");
                postSubmit.disabled = false;
            }
        } else {
            console.log("Nisu ispunjena sva polja"),
                alert("Nisu ispunjena sva polja")

        }


    });


}
if (deleteButton != null) {
    deleteButton.addEventListener("click", async () => {
        var storageRef = firebase.storage().ref();
        await storageRef.child(oldPostCover).delete().catch(err => console.log(err));
        await firebase.firestore().collection("posts").doc(currentId).delete();
        window.location.replace("store.html")
    })
}



document.addEventListener("DOMContentLoaded", (e) => {
    getPosts();
    if (!location.href.includes("store.html") && !location.href.includes("create.html")) {
        getPost();
    }

})

openNav.addEventListener("click", (e) => {
    document.getElementById("nav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px"
});

closeNav.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("nav").style.width = "0px";
    document.getElementById("main").style.marginLeft = ""

})

var functions = firebase.functions();
// add admin cloud function
var adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
  e.preventDefault();

  var adminEmail = document.querySelector('#admin-email').value;
  var addAdminRole = functions.httpsCallable('addAdminRole');
  
  addAdminRole({ email: adminEmail }).then(result => {
    console.log(result);
  });
});
// listener
auth.onAuthStateChanged(user => {
  if (user) {
      user.getIdTokenResult().then(getIdTokenResult => {
          user.admin = getIdTokenResult.claims.admin;
          setupUI(user);
      })
    db.collection('guides').onSnapshot(snapshot => {
      setupGuides(snapshot.docs);
     
      
    }, err => console.log(err.message));
    
  } else {
    setupUI();
    setupGuides([]);
  }
});

// napravi nove kupone
var createSecondForm = document.querySelector('#create-form');
createSecondForm.addEventListener('submit', (e) => {
  e.preventDefault();
  db.collection('guides').add({
    title: createSecondForm.title.value,
    content: createSecondForm.content.value
  }).then(() => {
    // close the create modal & reset form
    var modal = document.querySelector('#modal-create');
    M.Modal.getInstance(modal).close();
    createSecondForm.reset();
  }).catch(err => {
    console.log(err.message);
  });
});

// signup
var signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // informacije o useru
  var email = signupForm['signup-email'].value;
  var password = signupForm['signup-password'].value;

  // registruj usera i dodaj u Firestore
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    return db.collection('users').doc(cred.user.uid).set({
      bio: signupForm['signup-bio'].value
    });
  }).then(() => {
    // zatvori modal
    var modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
  });
});

// logout
var logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// login
var loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // informacije o useru
  var email = loginForm['login-email'].value;
  var password = loginForm['login-password'].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // zatvori modal i reset formu
    var modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });

});
// DOM elements
var guideList = document.querySelector('.guides');
var loggedOutLinks = document.querySelectorAll('.logged-out');
var loggedInLinks = document.querySelectorAll('.logged-in');
var accountDetails = document.querySelector('.account-details');
var adminItems = document.querySelectorAll(".admin")

var setupUI = (user) => {
  if (user) {

    if(user.admin){
        adminItems.forEach(item => item.style.display = "block")
    }
    // account info
    db.collection('users').doc(user.uid).get().then(doc => {
        var html = `
        <div>Logged in as ${user.email}</div>
        <div>${doc.data().bio}</div>
        <div class ="blue-text">${user.admin ? 'Admin' : ''}</div>
      `;
      accountDetails.innerHTML = html;
    });
    // prikazi elemente
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {
    adminItems.forEach(item => item.style.display = "none")
    // 
    accountDetails.innerHTML = '';
    // user odjavljen
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};

// postavi kupon
var setupGuides = (data) => {

  if (data.length) {
    var html = '';
    data.forEach(doc => {
        var guide = doc.data();
        var li = `
        <li>
          <div class="collapsible-header grey lighten-4"> ${guide.title} </div>
          <div class="collapsible-body white"> ${guide.content} </div>
        </li>
      `;
      html += li;
    });
    guideList.innerHTML = html
  } else {
    guideList.innerHTML = '<h5 class="center-align">Login to view guides</h5>';
  }
  

};

// materialize
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);

});
//search
$(document).ready(function () {
    $("#search").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#main *").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});



