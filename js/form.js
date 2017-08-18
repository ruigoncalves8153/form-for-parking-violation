var message;
var email_to;
var email_subject;

//when the page loads
$(window).on('load', function(){
  
  //information stored in variable window.localStorage
  loadsPersonalInfo();
  
  //populates HTML select according to the information on municipalities.js file
  populatesMunicipalities();
  //populates HTML select according to the information on penalties.js file
  populatesPenalties();

  //initializes date and time with current date and time
  var date = new Date();
  $("#date").datepicker('setDate', date);
  var currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
  $("#time").val(currentTime);

  // if user cookie
  if (enable_user_cookie){
    getUserCookie();
  }
  
  //if images support enabled show
  if (images_support) {
    $("#image_selector").show();
  }
  
  // Get Localization if available   
  if (map_reverse_location) {
    getLocation() // this may return that map_reverse_location isn't available with "false" value
  }

});

//##############################################################################################################
//##############################################################################################################

//when user clicks "generate_email"
$("#generate_email").click(function(){

  if (!debug) {
    //campos vazios
    var to_break=false;
    $(".mandatory").each(function(){
    if ($(this).val().replace(/^\s+|\s+$/g, "").length == 0){
      alert("Preencha todos os campos obrigatórios assinalados com *");
      to_break = true;
      return false;
    }
    });
    if(to_break){
    return;
    }
  }

  // Updates Cookie -- for web version
  if (enable_user_cookie){ 
    setUserCookie();
  }
  
  //detects inf the name is correctly filled in
  var Name = $("#name").val();
  if (!isFullNameOK(Name) && !debug){
      alert("Insira o nome completo");
      return;
  }
  var ShortName = Name.split(' ')[0] + " " +  Name.split(' ')[(Name.split(' ')).length-1];
  
  //detects if the car plate is correctly filled in
  if ((!isCarPlateOK()) && (!debug)) {
    alert("Preencha a matrícula em maiúsculas no formato XX-XX-XX");
    return;
  }
  var plate_str = getCarPlate();
  
  //from here the inputs are correctly written
    
  //PREAMBLE
  var preamble = "Para enviar email para ";
  for (var key in MUNICIPALITIES){
    if(!MUNICIPALITIES.hasOwnProperty(key)) continue;
    
    var obj = MUNICIPALITIES[key];                             
    if ($("#municipality").val() == obj.name){
      preamble += '<a href="mailto:' + obj.email + '">' + obj.email + '</a>';
      email_to = obj.email;        
    }
  } 
  preamble += " clique no seguinte botão:"

  var mainMessage = getMainMessage(plate_str, ShortName);
  
  $("#preamble").html(preamble);
  $("#message").html(mainMessage);
  $("#second_stage").show();
  
  //scrolls to the generated message
  $('html, body').animate({
      scrollTop: $("#message").offset().top
  }, 1000);
});

//limpar a mensagem para o email, remove HTML tags, 
//pois o mailto não aceita HTML tags, apenas texto simples 
function clean_message() {
  var temp = message;
  temp = temp.replace(/<b\s*\/?>/mg,"");
  temp = temp.replace(/<\/b\s*\/?>/mg,"");
  temp = temp.replace(/<br\s*\/?>/mg,"\n");
  return temp;
}

//add zeros to numbers, ex: pad(7, 3)="007"
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

//botão de gerar email
$("#button2").click(function(){
  clipboard.copy({
    "text/html": messageImg
  });
  alert("Abrir-se-á de seguida o seu cliente de mail, bastando depois anexar a foto!\n\n\nCaso o cliente de mail não se abra, a mensagem foi copiada para o seu ambiente de trabalho!\n1)Crie uma mensagem de email,\n2)Cole o texto no corpo da mensagem clicando CTRL-V,\n3)Envie para " + email_to);

  email_subject = "Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada";
    
  email_subject = encodeURIComponent(email_subject);
  clean_msg = encodeURIComponent(clean_message());
  
  window.open('mailto:'+encodeURIComponent(email_to)+'?subject='+email_subject+'&body='+clean_msg);  
});

var geoL = { coords : { longitude : 0, latitude : 0 }};



