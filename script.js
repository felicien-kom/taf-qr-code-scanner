// Elements utiles du DOM
const divFile = document.getElementById('info-file');
const inputFile = document.getElementById('qr-image');
const blurPage = document.getElementById('blur-page');
const btnCamera = document.getElementById('btn-camera');
const myStream = document.getElementById('my-stream');
const btnCloseStream = document.getElementById('btn-close-stream');
const result = document.getElementById('result');
const resultValue = document.getElementById('result-value');
const btnCloseResult = document.getElementById('btn-close-result');
const btnCopyLink = document.getElementById('btn-copy-link');
const btnFollowLink = document.getElementById('btn-follow-link');
const indicCopy = document.getElementById('indic-copy');
const indicFile = document.getElementById('indic-file');
const btnScanYour = document.getElementById('btn-scan-your');
const btnDestroy = document.getElementById('destroy');
const divHistory = document.getElementById('history');
const btnHistory = document.getElementById('btn-history');
const btnCloseHistory = document.getElementById('btn-close-history');

// Apercu Video de la Camera
const myVideo = document.getElementById('video');

let animFrameId;// Identifiant de contrôle des frames
let responseCode = false;// 
let timeoutId;// Identifiant de contrôle de la capture vidéo

let donnee = '';// Donnee principale contenue dans le scan

let myFile;// Fichier uploade soit par click() soit par glisser-deposer

const MAX_LENGTH_RESULT = 50;// Taille maximale en visible du lien ou de la donnée du QR Code
const MAX_PERIOD_VIDEO = 5000;// Durée maximale ou la camera cherche un QR Code

// Extensions de fichiers acceptes avant le scan
const allowedExtensions = [
    "jpg",   // JPEG standard
    "jpeg",  // Variante de jpg
    "png",   // Transparence, très répandu
    "webp",  // Compression moderne avec transparence
    "jfif",  // JPEG File Interchange Format
    "bmp",   // Bitmap, parfois utilisé dans des environnements legacy
    "tiff",  // Haute qualité, moins fréquent sur le web
    "gif",   // Animation (possible QR sur image fixe)
    "svg",   // Vectoriel (rare mais possible pour QR généré)
    "heic",  // Format utilisé sur iOS (attention à la compatibilité)
    "avif",  // Très efficace en compression, compatible avec canvas
    "ico",   // Icônes (peut contenir image utilisable)
    "cur",   // Curseur Windows, similaire à .ico
    "dds",   // Format compressé DirectDraw
    "tga",   // Targa — format legacy utilisé en imagerie numérique
    "raw",   // Format brut (nécessite traitement spécifique)
];


/*******************************************************/
// Gestion de la persistance : historique des recherches visuelles (des scans)
let myQRKey = "myQRKey";
let tempQRHistory = window.localStorage.getItem(myQRKey);
let myQRHistory = [];

if(tempQRHistory){
    myQRHistory = JSON.parse(tempQRHistory);
    console.log("Historique recupere depuis le cache.");
}
else{
    window.localStorage.setItem(myQRKey, JSON.stringify(myQRHistory));
    console.log("Historique Absent. Initialisation !");
}
// Verification
console.log("Historique à ce départ :");
console.log(myQRHistory);
displayHistory();// Affichage de l'historique sauvegardé

// Fonction utile pour enregistrer le resultat d'un scan dans l'historique persistant
function saveScan(msg){
    myQRHistory.push(msg);
    window.localStorage.setItem(myQRKey, JSON.stringify(myQRHistory));
    // Verification
    // console.log("Historique actuel :");
    // console.log(myQRHistory);
}

// Foncton utile pour Afficher la representation HTML d'un element de l'historique
function formatQRItem(index){
    let msg = myQRHistory[index];
    let divItem = document.createElement('div');
    divItem.classList.add('history-item');
    let spanValue = document.createElement('span');
    spanValue.classList.add('item-value');
    // spanValue.id = 'item-value-' + index;
    spanValue.innerHTML = '' + ((msg.length > 105) ? msg.slice(0, 100) + "..." : msg);
    let spanOptions = document.createElement('span');
    spanOptions.classList.add('item-options');

    if(isURL(msg)){
        let btnFollow = document.createElement('button');
        btnFollow.setAttribute('type', 'button');
        btnFollow.setAttribute('title', 'Follow');
        btnFollow.classList.add('follow');
        btnFollow.dataset.specialNumber = index;
        btnFollow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">' +
                                '<path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/>' +
                            '</svg>';
        spanOptions.appendChild(btnFollow);
    }
    
    let btnCopy = document.createElement('button');
    btnCopy.setAttribute('type', 'button');
    btnCopy.setAttribute('title', 'Copy');
    btnCopy.classList.add('copy');
    btnCopy.dataset.specialNumber = index;
    btnCopy.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">' +
                            '<path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>' +
                        '</svg>';
    spanOptions.appendChild(btnCopy);

    let btnDelete = document.createElement('button');
    btnDelete.setAttribute('type', 'button');
    btnDelete.setAttribute('title', 'Delete');
    btnDelete.classList.add('delete');
    btnDelete.dataset.specialNumber = index;
    btnDelete.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">' +
                            '<path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>' +
                        '</svg>';
    spanOptions.appendChild(btnDelete);

    divItem.appendChild(spanValue);
    divItem.appendChild(spanOptions);
    return divItem;
}

// Fontion utile pour afficher l'historique
function displayHistory(){
    let historyList = document.getElementById('history-list');
    //let tmp = '';
    historyList.innerHTML = '';
    if(myQRHistory.length == 0){
        historyList.innerHTML = '<div>No searches yet !</div>';
    } else {
        for(let index in myQRHistory){
            //tmp =  formatQRItem(myQRHistory[index]) + '' + tmp;
            historyList.prepend(formatQRItem(index));
        }
    }
}

// Drag and Drop + Click
divFile.addEventListener('click', ()=>{
    inputFile.click();
});
divFile.addEventListener('dragover', (e)=>{
    e.preventDefault();
    divFile.classList.add('holo');
});
divFile.addEventListener('dragleave', (e)=>{
    e.preventDefault();
    divFile.classList.remove('holo');
});
divFile.addEventListener('drop', (e)=>{
    e.preventDefault();
    divFile.classList.remove('holo');
    // Recuperation du fichier glissé
    myFile = e.dataTransfer.files[0];
    // console.log('Hum : ' + myFile);
    verifFile(myFile);
});
inputFile.addEventListener('change', ()=>{
    // divFile.classList.remove('holo');
    // Recuperation du fichier uploadé
    myFile = inputFile.files[0];
    // console.log('Hum : ' + myFile);
    verifFile(myFile);
});

// Fonction utile pour verifier si le fichier uploadé est bien une image et lancer la QR Code recherche si oui
function verifFile(file){
    if(file){// myFile peut être undefined car on peut glisser-déposer un element qui n'est pas un fichier
        console.log('' + myFile.name);
        const extension = file.name.split('.').pop().toLowerCase();

        if(allowedExtensions.includes(extension)){
            indicFile.innerHTML = 'Add your image here';
            // indicFile.innerHTML = 'Image received';
            // Conversion du fichier binaire en URL data/image
            const img = new Image();
            img.onload = function() {
                scanImage(img);// On scanne l'image de manière ponctuelle
                // Nettoyage de l'URL temporaire
                URL.revokeObjectURL(img.src);
            };
            img.src = URL.createObjectURL(file);
            //*/
            // scanImage(new Image(file));
        } else{
            // Si le fichier n'est pas une image (Exemple : .txt)
            indicFile.innerHTML = '<span style="color: red; font-weight:bold;">Invalid File<br>Try again<span>';
        }
    }
}

// Fonction utilisée pour scanner l'image uploadée (si valide)
function scanImage(img){
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    cvs.width = img.width;
    cvs.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const code = jsQR(imageData.data, cvs.width, cvs.height);
    console.log("Scan de l'image en cours");
    if (code) {// SI un code QR est disponible
        blurPage.classList.add('show-blur');
        donnee = code.data;// On recupere la donnee
        if(isURL(donnee)){// Si c'est une URL ou adresse web
            btnFollowLink.classList.remove('hide-btn');
            indicCopy.innerHTML = 'Copy the link';
        } else{// Sinon
            btnFollowLink.classList.add('hide-btn');
            indicCopy.innerHTML = 'Copy the text';
        }
        
        // On affiche le resultat mais pas tout s'il est trop long
        resultValue.innerHTML = (donnee.length > MAX_LENGTH_RESULT) ? donnee.slice(0, MAX_LENGTH_RESULT) + "..." : donnee;
        result.classList.add('show-result');
        // Sauvegarde de l'historique
        saveScan(donnee);
        displayHistory();// Reaffichage pour correpondre visuellement
    } else {
        // Ici on se contente d'alert "Aucun code trouvé"
        alert('Aucun code trouvé');
    }
}


btnCamera.addEventListener('click', ()=>{
    blurPage.classList.add('show-blur');
    myStream.classList.add('show-stream');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            // stream = s;
            // myVideo.setAttribute('autolay', 'autoplay');
            myVideo.srcObject = stream;
            myVideo.play();
            scan(); // démarrer la boucle de scan
            timeoutId = setTimeout(() => {
                if(!responseCode){// Attention au point d'exclamation ici
                    cancelAnimationFrame(animFrameId);
                    myVideo.srcObject?.getTracks().forEach(track => track.stop());
                    blurPage.classList.remove('show-blur');
                    myStream.classList.remove('show-stream');
                    alert("No code has been detected during the allowed period.");
                }
            }, MAX_PERIOD_VIDEO);
        })
        .catch(err => {
            blurPage.classList.remove('show-blur');
            myStream.classList.remove('show-stream');
            alert('Error from acees to camera. ' + err);////////////////////////////
        });
});

// Fonction utilisée pour scan toute QR Code detecté par la Camera
function scan() {
    if (myVideo.readyState === myVideo.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = myVideo.videoWidth;
        canvas.height = myVideo.videoHeight;
        context.drawImage(myVideo, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
            // Indication
            responseCode = true;
            donnee = code.data;
            cancelAnimationFrame(animFrameId);
            myVideo.srcObject.getTracks().forEach(track => track.stop());
            // alert("QR détecté : " + donnee);
            //blurPage.classList.remove('show-blur');
            myStream.classList.remove('show-stream');
            
            if(isURL(donnee)){
                btnFollowLink.classList.remove('hide-btn');
                indicCopy.innerHTML = 'Copy the link';
            } else{
                btnFollowLink.classList.add('hide-btn');
                indicCopy.innerHTML = 'Copy the text';
            }
            
            resultValue.innerHTML = (donnee.length > MAX_LENGTH_RESULT) ? donnee.slice(0, MAX_LENGTH_RESULT) + "..." : donnee;
            result.classList.add('show-result');
            saveScan(donnee);
            displayHistory();
            return ;
        }
    }
    /*********************************/
    animFrameId = requestAnimationFrame(scan);
    // Code spécial qui planifie l'execution de la fonction scan au rythme des frames
    // de manière optimale. Elle est plus efficace que setInterval car s'adpte au rythme de l'appareil
}

// Fonction utile pour vérifier si la donnée est une URL ou une adresse web ou juste un texte
function isURL(str) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocole
        '((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|' + // nom de domaine
        'localhost|' + // localhost
        '\\d{1,3}(\\.\\d{1,3}){3})' + // adresse IP
        '(\\:\\d+)?(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?'+ // chemin
        '(\\?[;&a-zA-Z0-9%_+.~#=\\-]*)?'+ // query
        '(\\#[-a-zA-Z0-9_]*)?$','i');
    return pattern.test(str);
}

btnCloseStream.addEventListener('click', ()=>{
    clearTimeout(timeoutId);
    blurPage.classList.remove('show-blur');
    myStream.classList.remove('show-stream');
    cancelAnimationFrame(animFrameId);
    myVideo.srcObject.getTracks().forEach(track => track.stop());
});

btnCloseResult.addEventListener('click', ()=>{
    blurPage.classList.remove('show-blur');
    result.classList.remove('show-result');
});

btnCopyLink.addEventListener('click', ()=>{
    navigator.clipboard.writeText(donnee)
        .then(() => {
            let temp = (isURL(donnee)) ? "Link copied" : 'Text Copied';
            showPersoPopUp(temp);
        })
        .catch(err => {
            console.error("Error from copy:", err);
        });
});

btnFollowLink.addEventListener('click', ()=>{
    let target = document.createElement('a');
    target.href = '' + donnee;
    target.setAttribute('target', '_blank');
    target.click();
});

btnScanYour.addEventListener('click', ()=>{
    alert('Please upload first an image !');
});

btnDestroy.addEventListener('click', ()=>{
    if(myQRHistory.length !=0 && confirm('Do you really want to delete all your history ?')){
        myQRHistory = [];
        window.localStorage.setItem(myQRKey, JSON.stringify(myQRHistory));
        displayHistory();
    }
});

/*
let copySwitches = document.querySelectorAll('.copy');
copySwitches.forEach(item =>{
    item.addEventListener('click', ()=>{
        let msg = myQRHistory[item.dataset.specialNumber];
        navigator.clipboard.writeText(msg)
            .then(() => {
                console.log('Copy processed with success.');
            })
            .catch(err => {
                console.error("Error from copy:", err);
            });
    });
});

let followSwitches = document.querySelectorAll('.follow');
followSwitches.forEach(item =>{
    item.addEventListener('click', ()=>{
        let target = document.createElement('a');
        target.href = '' + myQRHistory[item.dataset.specialNumber];
        target.setAttribute('target', '_blank');
        target.click();
    });
});

const deleteSwitches = document.querySelectorAll('.delete');
deleteSwitches.forEach(item =>{
    item.addEventListener('click', ()=>{
        myQRHistory.splice(item.dataset.specialNumber, 1);
        displayHistory();
        console.log('OK');
        // deleteSwitches = document.querySelectorAll('.delete');
    });
});
*/

// Evenement s'adaptant au reaffichage de l'historique, et plus optimal en terme de ressources
// pour l'interactivité des boutons propres à chaque instance de l'historique
document.getElementById('container').addEventListener('click', (event)=>{
    //console.log(event.target);
    let item = event.target.closest('button');
    if(item){// Uniquement si on a obtenu un bouton car 
    // sinon verifiera toutes les conditions à quasiment tout clic à l'écran
        if(item.classList.contains('delete')){
            myQRHistory.splice(item.dataset.specialNumber, 1);
            window.localStorage.setItem(myQRKey, JSON.stringify(myQRHistory));
            displayHistory();
            showPersoPopUp('Item successfully deleted.');
        } else if(item.classList.contains('copy')){
            let msg = myQRHistory[item.dataset.specialNumber];
            navigator.clipboard.writeText(msg)
                .then(() => {
                    console.log('Copy processed with success.');
                    showPersoPopUp('Copy processed with success.');
                })
                .catch(err => {
                    console.error("Error from copy:", err);
                });
        } else if(item.classList.contains('follow')){
            let target = document.createElement('a');
            target.href = '' + myQRHistory[item.dataset.specialNumber];
            target.setAttribute('target', '_blank');
            target.click();
        }
    }
});

// Fonction utile pour afficher une Pop Up avec un message donné
function showPersoPopUp(msg){
    let myPopup = document.createElement('div');
    myPopup.classList.add('my-pop-up');
    myPopup.innerHTML = '' + msg;
    document.getElementById('container').appendChild(myPopup);
    setTimeout(() => {
        myPopup.classList.add('fade');
    }, 1000);
    setTimeout(() => {
        document.getElementById('container').removeChild(myPopup);
    }, 3000);
}

btnHistory.addEventListener('click', ()=>{
    divHistory.classList.add('show-history');
});
btnCloseHistory.addEventListener('click', ()=>{
    divHistory.classList.remove('show-history');
});