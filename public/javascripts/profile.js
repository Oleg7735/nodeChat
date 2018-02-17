document.addEventListener('DOMContentLoaded', function(){
    var fileLoader = document.getElementById('newAvatar');
    fileLoader.onchange = function(evt){
        var tgt = evt.target || window.event.srcElement;
        var files = tgt.files;
        if(FileReader && files && files.length){
            var fr = new FileReader();
            fr.onload = function(){
                document.getElementById('avatar').src = fr.result;
            };
            fr.readAsDataURL(files[0]);
        }
    }
});