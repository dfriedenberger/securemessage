
//Konstanten 
var MAXW = 65;  //Breite der verschluesselten Nachricht 
var animateTime = 700; //show/hide time


/* 
 * Define trim funktion if not exists
 */
if (typeof String.prototype.trim === "undefined") {
        String.prototype.trim = function () {
                return this.replace(/\s+$/, "").replace(/^\s+/, "");
        };
} 

/* 
 * extensions for jquery 
 */

jQuery.fn.extend({
  appendText: function(text){
    return this.each(function(i) {
	  $(this).val( $(this).val() + text);
    });
  },
  getText: function(){
      var text = $(this).val();
      //any char in text , if only space than return empty string
      if(text.trim() == "") return "";

      return text;
  },
  enableButton: function(enable){
      return this.each(function(i) {
	if(enable)
	  $(this).removeAttr('disabled');
	else
	  $(this).attr('disabled', 'disabled');
    });
   },
   encryptText: function(encrypt){
      return this.each(function(i) {
	if(encrypt)
	{
	  $(this).removeClass('decryptedmessage');
	  $(this).addClass('encryptedmessage');
	}
	else
	{
	  $(this).removeClass('encryptedmessage');
	  $(this).addClass('decryptedmessage');
	}
    });
   }
});






function fillLine(line,width,token)
{
    while( line.length < width ) { line += token }
    return line;
}

function isBASE64(text)
{
  var a = text.split('');
  
  if(a.length == 0) 
    return false;
  
  
  for(var i = 0;i < a.length;i++)
  {
    if('A' <= a[i] && a[i] <= 'Z') continue;
    if('a' <= a[i] && a[i] <= 'z') continue;
    if('0' <= a[i] && a[i] <= '9') continue;
    if('+' == a[i]) continue;
    if('/' == a[i]) continue;
    if('=' == a[i]) continue;
    return false;
  }
  
  return true;
  
}

function GetTokenType(token)
{
    if(token == 'START') return 1;
    if(token == 'ENDE') return 2;
    return 0;
}

function GetEncryptedText(id)
{
   var message = $(id).val();
   var base64 = "";
   //parse message for BASe64-String
   var lines = message.split("\n");
   for(var i = 0;i < lines.length;i++)
   {
     var line = lines[i].trim();
     var token = line.split(" ");
     for(var x = 0; x < token.length;x++)
     {
            var data = token[x].trim();
	    var type = GetTokenType(data);
	    switch(type)
	    {
	      case 0: //Any Data
                break;
	      case 1: //Start
                base64 = ""
                continue;
	     case 2: //Ende
                return base64;
	     default: //Encryption mode
	        
                continue;
	    }
	    
	    if(isBASE64(data))
	    {
	      base64 += data;
	    }
     }
   }
   
   return "";
}


/*
 * Update funktion for messagepanel and formular
 */

var SUCC_ENC = 1; /* Successful encryption */
var SUCC_DEC = 2; /* Successful decryption */
var FAIL_DEC = 3; /* failed decryption     */

function updateMessages(mesg)
{
  switch(mesg)
  {
    
    case SUCC_ENC:
      $('#messageFailedDecryption').slideUp(animateTime);
      $('#messageSuccessfulDecryption').slideUp(animateTime);
      $('#messageSuccessfulEncryption').slideDown(animateTime);      
      break;

    case SUCC_DEC:
      $('#messageFailedDecryption').slideUp(animateTime);
      $('#messageSuccessfulDecryption').slideDown(animateTime);
      $('#messageSuccessfulEncryption').slideUp(animateTime);      
      break;
      
    case FAIL_DEC:
      $('#messageFailedDecryption').slideDown(animateTime);
      $('#messageSuccessfulDecryption').slideUp(animateTime);
      $('#messageSuccessfulEncryption').slideUp(animateTime);      
      break;
    
    default:
      $('#messageFailedDecryption').slideUp(animateTime);
      $('#messageSuccessfulDecryption').slideUp(animateTime);
      $('#messageSuccessfulEncryption').slideUp(animateTime);
      break;
  }
}


function updateFormular()
{
  var encrypted  = GetEncryptedText('#message');
  var decrypted  = $('#message').getText();
  
  if(encrypted.length == 0 && decrypted.length == 0)
  {
    //init state
    $('#encrypt').enableButton(false);
    $('#decrypt').enableButton(false);
    $('#message').encryptText(false);
    $('#messageInsertKey').slideUp(animateTime);
    updateMessages(0);
    return;
  }
  
  if($('#key').val().trim().length == 0)
  {
    //enable message insert key
    $('#messageInsertKey').slideDown(animateTime);
    $('#encrypt').enableButton(false);
    $('#decrypt').enableButton(false);
    updateMessages(0);
    return;
  }
  else
  {
    $('#messageInsertKey').slideUp(animateTime);
  }
  
   
  if(encrypted.length > 0)
  {
    //inserted text is encrypted 
    $('#decrypt').enableButton(true);
    $('#encrypt').enableButton(false);
    $('#message').encryptText(true);
  }
  else if(decrypted.length > 0)
  {
    //inserted text is an plain text
    $('#encrypt').enableButton(true);
    $('#decrypt').enableButton(false);
    $('#message').encryptText(false);
  }
 
  
  
}



$(document).ready(function () {
  
    /*
     * Init
     */
    $('#messageActivateJavascript').hide(0);
    $('#message').attr('cols',MAXW);
    $('#key').attr('size',MAXW - 11);

          
    
    /*
     * Init formular and add eventhandler
     */
    updateFormular(); 
    $('#message').keyup(updateFormular);
    $('#key').keyup(updateFormular);
   
    
    
    /*
     *  some interactive elements for open and close 
     */
    $('.closeParent').click(function(event) {
      event.preventDefault();
      $(this).parent().slideUp(animateTime);
    });
    
    
    $('.toggleNext').click(function(event) {
       event.preventDefault();
       $(this).next().slideToggle(animateTime);
    });
    
    
    
    
    
    
    $('#encrypt').click(function(event) {
      
      event.preventDefault();
      
      var message  = $('#message').getText();
      var key      = $('#key').val();

           
      /*
       * encrypt message with key as passphrase
       */
      var encrypted = CryptoJS.AES.encrypt(message,key );

      //Write Message
      $('#message').val("");
      
      
      //copy preamble message to textarea 
      var text =  $('#preambleMessage').html().split('\n');
      for(var i = 0;i < text.length;i++)
      {
	  var line = text[i].trim();
	  if(line.length == 0) continue;
	  $('#message').appendText(line + '\n');
      }
        
      $('#message').appendText('\n');
      
      $('#message').appendText(fillLine("-- START --",MAXW,"-") + "\n");
      
      var data = ""+encrypted;
      while(data.length > 0)
      {
	  if(data.length >= MAXW)
	  {
	    $('#message').appendText(data.substring(0,MAXW)+'\n');
	    data = data.substring(MAXW);
	    continue;
	  }
	  if(data.length > 0)
	  {
	   $('#message').appendText(data+'\n');
	   data = "";
	  } 
	 break;
      }
      $('#message').appendText(fillLine("-- ENDE --",MAXW,"-") + "\n");
      
      updateMessages(SUCC_ENC);      
      updateFormular(); 

      
    });


  $('#decrypt').click(function(event) {
      
    event.preventDefault();
      
    var message  = GetEncryptedText('#message');
    var key      = $('#key').val();

  
  try
    {
	 
	 
         var decrypted = CryptoJS.AES.decrypt(message.toString(CryptoJS.enc.Utf8), key);
         var words = decrypted.toString(CryptoJS.enc.Utf8);

	 if(words.length > 0)
	 {
	   $('#message').val(words);
	   
	 
	   updateMessages(SUCC_DEC);
	   updateFormular(); 
	   return;
	 }
    }
    catch(ex)
    {
	   /* alert(ex); */
    } 
    updateMessages(FAIL_DEC);

  });
  
     
});
 
